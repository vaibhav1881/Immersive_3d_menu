// Type declarations for @google/model-viewer
declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement> & {
                src?: string;
                alt?: string;
                poster?: string;
                'camera-controls'?: boolean;
                'auto-rotate'?: boolean;
                'ar'?: boolean;
                'ar-modes'?: string;
                'shadow-intensity'?: string;
                'environment-image'?: string;
                'exposure'?: string;
                'touch-action'?: string;
                'interaction-prompt'?: string;
                'camera-orbit'?: string;
                'min-camera-orbit'?: string;
                'max-camera-orbit'?: string;
                'field-of-view'?: string;
                onLoad?: () => void;
            },
            HTMLElement
        >;
    }
}

declare module '@google/model-viewer' {
    const ModelViewer: any;
    export default ModelViewer;
}
