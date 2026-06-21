import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/** 予期せぬエラーで真っ白にならないよう、画面全体を保護する */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : '不明なエラー',
    };
  }

  componentDidCatch(error: unknown) {
    console.error('[shikou-desk] 画面エラー', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-muted">
          <div className="card-surface max-w-md w-full p-8 text-center">
            <div className="text-4xl mb-3">🛟</div>
            <h1 className="text-lg font-semibold mb-2">
              画面の表示でエラーが発生しました
            </h1>
            <p className="text-sm text-ink-soft mb-1">
              データは保存されています。ページを再読み込みしてください。
            </p>
            <p className="text-xs text-ink-faint mb-5 break-words">
              {this.state.message}
            </p>
            <button
              className="btn-primary px-5 py-2.5"
              onClick={() => window.location.reload()}
            >
              再読み込み
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
