

export default function LoginLoadingOverlay() {
    return (
        <div className="login-loading-overlay" role="status" aria-live="polite">
            <div className="login-loading-card">
                <div className="login-loading-icon">
                    <span className="login-loading-lock">🔐</span>
                </div>

                <h2>Logging you in...</h2>

                <p>Securely verifying your credentials</p>

                <div className="login-progress-track">
                    <div className="login-progress-bar" />
                </div>

                <span className="login-loading-note">
                    Please wait a moment
                </span>
            </div>
        </div>
    );
}
