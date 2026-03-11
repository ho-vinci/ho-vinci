# コーディング規約

このプロジェクトのコーディング規約とベストプラクティスを定義します。
すべての新規コードおよび既存コードの修正は、これらの規約に従ってください。

## 📏 基本規約

### 1. 行長と関数サイズ
- **最大行長**: 88文字以内
- **関数の長さ**: 15行以内を目安（複雑な処理は分割）
  - 15行を超える場合は、ヘルパー関数に分割すること
  - ただし、単純なデータ変換やI/Oラッパーなど、少し長くても問題になりにくく、15行以内にした結果、かえって不自然な分割や意味の薄い関数が増える可能性がある場合のみ、15行を超えてもよい。
  - 1つの関数は1つの責任のみを持つこと

### 2. エラーハンドリング
- **カスタムエラークラスの使用**: `lib/errors.ts` で定義されたエラークラスを使用
- **日本語メッセージ**: ユーザー向けエラーメッセージは必ず日本語で記述
- **エラーコード**: すべてのカスタムエラーにエラーコードを付与

#### エラークラスの使用例
```typescript
// ❌ Bad
throw new Error('Not found')

// ✅ Good
import { AuthenticationError } from '@/lib/errors'
throw new AuthenticationError('ユーザーが見つかりません')
```

### 3. コメント
- **重要な処理**: 必ず日本語コメントを追加
- **関数の説明**: JSDocスタイルで記述
- **複雑なロジック**: なぜそのような実装をしたのか理由を記述

#### コメントの例
```typescript
/**
 * ユーザーのプランを取得
 * 管理者の場合は自動的にProプラン、それ以外はpublicMetadataから取得
 * @param userProvider - ユーザー取得関数（DIパターン）
 * @returns ユーザーのプランタイプ（free, pro）
 */
export async function getUserPlan(
  userProvider: () => Promise<User | null> = currentUser
): Promise<PlanType> {
  // 実装...
}
```

### 4. 単一責任原則（SRP）
- 1つの関数は1つの責任のみを持つ
- 複数の責任を持つ関数は、小さな関数に分割する
- 関数名は責任を明確に表現する

#### 単一責任原則の例
```typescript
// ❌ Bad: 複数の責任が混在
async function createUser(data) {
  const validated = validate(data)  // 検証
  const user = await db.insert(...)  // DB操作
  await sendEmail(user)  // メール送信
  return user
}

// ✅ Good: 責任を分割
function validateUserData(data) { ... }
async function insertUser(data) { ... }
async function sendWelcomeEmail(user) { ... }

async function createUser(data) {
  const validated = validateUserData(data)
  const user = await insertUser(validated)
  await sendWelcomeEmail(user)
  return user
}
```

## 🔍 コードレビュー観点

すべてのコード変更は、以下の観点でレビューすること。

### 1. 可読性
**観点**: 6ヶ月後の自分が理解できるか

- 変数名・関数名が意図を明確に表しているか
- マジックナンバー・マジックストリングが定数化されているか
- 複雑なロジックに十分な説明コメントがあるか
- 型定義が明確で、意図を理解しやすいか

#### チェックリスト
- [ ] 意図が明確な命名か
- [ ] マジックナンバーは `lib/constants.ts` に定数化されているか
- [ ] 複雑な処理にコメントがあるか
- [ ] 型が適切に定義されているか

### 2. 拡張性
**観点**: 新要件に対して変更箇所が局所的か

- 関心の分離ができているか（UI、ロジック、データアクセス）
- ハードコードされた値を設定ファイルに外出しできるか
- 新しいプランタイプ追加時に変更箇所が最小限か
- 新しい習慣タイプ追加時に変更箇所が最小限か

#### チェックリスト
- [ ] UI・ロジック・データアクセスが分離されているか
- [ ] 設定値が `lib/constants.ts` で管理されているか
- [ ] 新機能追加時の影響範囲が局所的か

### 3. テスタビリティ
**観点**: 単体テストが書きやすい構造か

- 外部依存が適切に注入可能か（DIパターン）
- 副作用のない純粋関数が適切に分離されているか
- モック・スタブが容易に作成できるか
- テストダブルのための境界が明確か

#### チェックリスト
- [ ] 外部依存がDIパターンで注入可能か
- [ ] 純粋関数とServer Actionが分離されているか
- [ ] モックが容易に作成できる構造か

#### テスタビリティの例
```typescript
// ✅ Good: DIパターンと純粋関数の分離
export function canAddHabitPure(
  currentCount: number,
  maxHabits: number
): boolean {
  return currentCount < maxHabits  // 純粋関数（テスト容易）
}

export async function canAddHabit(
  currentCount: unknown,
  userProvider = currentUser  // DIパターン
): Promise<boolean> {
  const validated = planSchemas.currentCount.parse(currentCount)
  const limits = await getPlanLimits(userProvider)
  return canAddHabitPure(validated, limits.maxHabits)
}
```

### 4. セキュリティ
**観点**: 入力値検証とエスケープ処理が適切か

- ユーザー入力の検証が適切に行われているか
- SQLインジェクション対策（Drizzle ORMの正しい使用）
- XSS対策（HTMLエスケープ、dangerouslySetInnerHTMLの不使用）
- 認証・認可のチェックが適切か
- 機密情報のログ出力がないか

#### チェックリスト
- [ ] すべてのServer Actionsでzod検証を実施しているか
- [ ] UUID、日付、文字列長が適切に検証されているか
- [ ] Drizzle ORMを正しく使用しているか（生SQLの不使用）
- [ ] 認証チェックが適切に行われているか
- [ ] エラーログに機密情報が含まれていないか

#### セキュリティの例
```typescript
// ✅ Good: zodによる入力値検証
import { habitSchemas } from '@/lib/validations'

export async function createHabit(data: unknown) {
  // 入力値検証
  const validated = habitSchemas.create.parse(data)

  // 認証チェック
  const user = await getAuthenticatedUser()

  // Drizzle ORMで安全にDB操作
  const [habit] = await db.insert(habits).values({
    name: validated.name,  // 検証済みデータのみ使用
    userId: user.id,
  }).returning()

  return habit
}
```

## 📁 ファイル構成規約

### ディレクトリ構造
```
lib/
├── constants.ts       # 定数定義（マジックナンバー/ストリング）
├── errors.ts          # カスタムエラークラス
├── validations.ts     # zodバリデーションスキーマ
├── auth-helpers.ts    # 認証・権限管理ヘルパー
└── plans.ts           # プラン関連の型・定数

app/actions/
├── habits.ts          # 習慣関連のServer Actions
├── projects.ts        # プロジェクト関連のServer Actions
├── plans.ts           # プラン関連のServer Actions
└── stripe.ts          # Stripe決済のServer Actions
```

### ファイル内の構成
```typescript
// 1. インポート
import { ... } from '...'

// 2. 型定義
export type UserType = ...
export interface UserData { ... }

// 3. 定数
export const MAX_USERS = 100

// 4. 純粋関数（ヘルパー関数）
export function calculateAge(...) { ... }

// 5. Server Actions（外部依存を含む）
export async function getUser(...) { ... }
```

## 🔧 推奨ツール

### 入力値検証
- **zod**: すべてのServer Actionsで使用
- スキーマは `lib/validations.ts` に集約

### 型安全性
- **TypeScript**: strict モード
- `any` 型の使用禁止（やむを得ない場合はコメントで理由を記述）

### コードフォーマット
- **Prettier**: 自動フォーマット
- **ESLint**: リンティング

## 📝 命名規約

### 変数・関数
- **変数**: camelCase（例: `userName`, `habitCount`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_HABITS`, `API_ENDPOINT`）
- **関数**: camelCase、動詞で始める（例: `getUserPlan`, `createHabit`）
- **純粋関数**: 末尾に `Pure` を付ける（例: `canAddHabitPure`）

### 型・インターフェース
- **型**: PascalCase（例: `UserType`, `PlanType`）
- **インターフェース**: PascalCase（例: `UserData`, `HabitRecord`）

### ファイル
- **コンポーネント**: kebab-case（例: `habit-list.tsx`, `today-input.tsx`）
- **ユーティリティ**: kebab-case（例: `auth-helpers.ts`, `constants.ts`）

## 🚀 開発フロー

### 新機能の追加
1. **要件定義**: 何を実装するか明確にする
2. **設計**: 関心の分離、テスタビリティを考慮
3. **実装**: コーディング規約に従って実装
4. **セルフレビュー**: 4つの観点でレビュー
5. **テスト**: 純粋関数のユニットテストを追加
6. **コミット**: 明確なコミットメッセージ

### コミットメッセージ
```
<種類>: <概要>

<詳細説明>

- 変更内容1
- 変更内容2
```

**種類**:
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `docs`: ドキュメント更新
- `test`: テスト追加
- `chore`: その他の変更

## ⚠️ 禁止事項

### 絶対に避けるべきこと
- ❌ `any` 型の使用（型安全性の喪失）
- ❌ マジックナンバー・マジックストリングの直接記述
- ❌ 入力値検証のスキップ
- ❌ 生SQLの直接実行
- ❌ `dangerouslySetInnerHTML` の使用
- ❌ 機密情報のログ出力
- ❌ グローバル変数の使用

### 注意すべきこと
- ⚠️ 15行を超える関数（分割を検討）
- ⚠️ 複数の責任を持つ関数（SRP違反）
- ⚠️ 副作用のある純粋関数
- ⚠️ テストが困難な構造

---

## 📚 参考資料

- [zodドキュメント](https://zod.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**最終更新**: 2025年11月
**適用範囲**: プロジェクト全体
