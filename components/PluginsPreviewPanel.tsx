export function PluginsPreviewPanel() {
  return (
    <div className="plugins-preview">
      <div className="plugins-preview__grid" aria-hidden="true" />
      <div className="plugins-preview__border">
        <div className="plugins-preview__window">
          <video
            className="plugins-preview__image"
            src="assets/promo/forge-demo-hq.webm"
            poster="assets/roundtable-preview.png"
            autoPlay
            loop
            muted
            playsInline
            aria-label="FORGE Round Table with multiple AI models discussing a build request"
          />
        </div>
      </div>
    </div>
  );
}
