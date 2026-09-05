# dm-proxy-generator

カード画像から、デュエル・マスターズの実カードサイズで印刷できる A4 PDF を作成するブラウザアプリです。

## 開発

```sh
pnpm install
pnpm dev
```

```sh
pnpm typecheck
pnpm build
```

## ドキュメント

- [アプリの仕様メモ](docs/proxy-pdf-app-spec.md)
- [ADR：設計判断の記録と運用ルール](docs/adr/README.md)

構成や技術選定など、後から理由を知りたくなる変更は [ADR テンプレート](docs/adr/テンプレート.md)から記録を作成し、実装と合わせてレビューします。採用後は、実際の効果や問題を振り返りとして追記します。
