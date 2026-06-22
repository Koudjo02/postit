<template>
  <div class="app-wrapper">
    <header class="header">
      <div class="header-inner">
        <div class="logo">
          <span class="pin">📌</span>
          <span class="logo-text">Le Mur</span>
        </div>
        <nav class="nav">
          <router-link :to="{ name: 'home' }" class="nav-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Voir le mur
          </router-link>
          <router-link :to="{ name: 'ajouter' }" class="nav-btn nav-btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouvelle note
          </router-link>
        </nav>
      </div>
    </header>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

.app-wrapper {
  min-height: 100vh;
  background-color: #e8dcc8;
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(180,160,120,0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(160,140,100,0.1) 0%, transparent 50%);
  font-family: 'Inter', sans-serif;
}

.header {
  background: #3d2b1f;
  border-bottom: 4px solid #2a1d14;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pin {
  font-size: 22px;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));
}

.logo-text {
  font-family: 'Caveat', cursive;
  font-size: 28px;
  font-weight: 700;
  color: #f5e6c8;
  letter-spacing: 1px;
}

.nav {
  display: flex;
  gap: 12px;
  align-items: center;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: #d4c4a0;
  transition: all 0.2s;
  border: 1.5px solid transparent;
}

.nav-btn:hover {
  background: rgba(245,230,200,0.1);
  color: #f5e6c8;
  border-color: rgba(245,230,200,0.2);
}

.nav-btn--primary {
  background: #c8860a;
  color: #fff8ee;
  border-color: #a36e08;
}

.nav-btn--primary:hover {
  background: #d4920c;
  color: #fff;
}

.nav-btn.router-link-active {
  color: #f5c518;
  border-color: rgba(245,197,24,0.3);
}

.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
}
</style>

