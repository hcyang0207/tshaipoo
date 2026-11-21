/**
 * 菜脯埕 (tshaipoo.com) - 核心全站共用腳本
 * 1. 解決 iPhone (iOS Safari) 嵌入 WebM 影片播放一次後無法重複播放的 loop 相容性問題
 * 2. 全站浮動式圓形 Back to Top 回到頂部按鈕
 */

(function() {
  'use strict';

  // ==========================================
  // 1. iPhone (iOS Safari) WebM 循環播放修復
  // ==========================================
  function initVideoLoopFix() {
    var videos = document.querySelectorAll('video');
    if (!videos.length) return;

    videos.forEach(function(video) {
      // 確保 iOS 行內播放與靜音屬性完備
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');

      if (video.hasAttribute('muted') || video.muted) {
        video.muted = true;
        video.defaultMuted = true;
      }

      // 只要具有 loop 屬性，全面掛載手動回放事件
      if (video.hasAttribute('loop') || video.loop) {
        // 機制 1: 標準 ended 事件回放
        video.addEventListener('ended', function() {
          video.currentTime = 0;
          var p = video.play();
          if (p && p.catch) p.catch(function() {});
        }, false);

        // 機制 2: 解決 iOS WebM 在播放完畢前 0.1~0.3s 卡死且不派發 ended 的問題
        var isResetting = false;
        video.addEventListener('timeupdate', function() {
          if (video.duration > 0 && video.currentTime >= video.duration - 0.25) {
            if (!isResetting) {
              isResetting = true;
              video.currentTime = 0;
              var p = video.play();
              if (p && p.catch) p.catch(function() {});
              setTimeout(function() { isResetting = false; }, 300);
            }
          }
        }, false);

        // 機制 3: 解決 iOS Safari 在影片結尾意外進入 pause 狀態的問題
        video.addEventListener('pause', function() {
          if (video.duration > 0 && video.currentTime >= video.duration - 0.4) {
            video.currentTime = 0;
            var p = video.play();
            if (p && p.catch) p.catch(function() {});
          }
        }, false);
      }
    });
  }

  // ==========================================
  // 2. 浮動式圓形 Back to Top 按鈕
  // ==========================================
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'back-to-top';
      btn.id = 'backToTop';
      btn.setAttribute('aria-label', '回到頁面頂端');
      btn.setAttribute('title', '回到頂端');
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 15l-6-6-6 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      document.body.appendChild(btn);
    }

    var scrollThreshold = 300;
    var ticking = false;

    function updateVisibility() {
      if (window.scrollY > scrollThreshold) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // 初始頁面位置檢查
    updateVisibility();
  }

  // DOM 載入後執行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initVideoLoopFix();
      initBackToTop();
    });
  } else {
    initVideoLoopFix();
    initBackToTop();
  }
})();
