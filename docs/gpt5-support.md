# GPT-5 API 対応テスト

このドキュメントではGPT-5 API対応のテスト方法を説明します。

## 設定例

### GitHub Actions ワークフローでの使用

```yaml
name: Code Review

permissions:
  contents: read
  pull-requests: write

on:
  pull_request:
  pull_request_review_comment:
    types: [created]

concurrency:
  group:
    ${{ github.repository }}-${{ github.event.number || github.head_ref ||
    github.sha }}-${{ github.workflow }}-${{ github.event_name ==
    'pull_request_review_comment' && 'pr_comment' || 'pr' }}
  cancel-in-progress: ${{ github.event_name != 'pull_request_review_comment' }}

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: f-kana/fk-ai-pr-reviewer@latest
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        with:
          debug: false
          review_simple_changes: false
          review_comment_lgtm: false
          # GPT-5を軽いタスクに使用
          openai_light_model: 'gpt-5'
          # GPT-5を重いタスクに使用
          openai_heavy_model: 'gpt-5'
```

## モデル選択のガイダンス

### 推奨設定

- **軽いタスク** (サマリー等): `gpt-4o` または `gpt-3.5-turbo`
- **重いタスク** (コードレビュー): `gpt-5` または `gpt-4o`

### GPT-5の特徴

- **最大トークン数**: 200,000
- **応答トークン数**: 8,000  
- **Knowledge cutoff**: 2025-08-01
- **適用場面**: 最高品質のコードレビューが必要な場合

## トークン制限

各モデルのトークン制限:

| モデル | 最大トークン | 応答トークン | Knowledge Cutoff |
|--------|------------|------------|------------------|
| gpt-5 | 200,000 | 8,000 | 2025-08-01 |
| gpt-4o | 128,000 | 4,000 | 2024-04-01 |
| gpt-4 | 8,000 | 2,000 | 2021-09-01 |
| gpt-3.5-turbo | 4,000 | 1,000 | 2021-09-01 |

## 注意事項

- GPT-5はプレミアム料金モデルです
- より大きなコンテキストウィンドウにより、より包括的な分析が可能
- API キーがGPT-5にアクセス可能であることを確認してください