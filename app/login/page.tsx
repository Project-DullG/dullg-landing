"use client";

import { useState } from "react";

export default function LoginPage() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>학원 관리 로그인</h1>
        <p>Google 계정으로 로그인하세요.</p>

        <button
          className="login-google-button"
          onClick={() => setShowDialog(true)}
          type="button"
        >
          Google로 로그인
        </button>
      </div>

      {showDialog && (
        <div className="login-dialog-overlay" onClick={() => setShowDialog(false)}>
          <div className="login-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="login-dialog-title">준비 중입니다</p>
            <p className="login-dialog-desc">
              학원 관리 기능은 현재 개발 중이며,<br />
              곧 사용할 수 있습니다.
            </p>
            <button
              className="login-dialog-button"
              onClick={() => setShowDialog(false)}
              type="button"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
