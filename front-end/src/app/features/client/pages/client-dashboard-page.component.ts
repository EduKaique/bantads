import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-client-dashboard-page',
  standalone: true,
  template: `
    <main class="dashboard-placeholder">
      <section class="dashboard-placeholder__card">
        <h1 class="dashboard-placeholder__title">Dashboard do cliente</h1>
        <p class="dashboard-placeholder__description">
          Esta area foi mantida separada para a futura implementacao do dashboard.
        </p>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .dashboard-placeholder {
        min-height: 100vh;
        padding: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e5e8e6;
        box-sizing: border-box;
      }

      .dashboard-placeholder__card {
        width: 660px;
        max-width: 100%;
        padding: 32px 40px;
        border-radius: 24px;
        background: #fafafa;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .dashboard-placeholder__title {
        margin: 0;
        color: #414946;
        font-family: 'Sora', sans-serif;
        font-size: 32px;
        font-weight: 500;
        line-height: 36px;
        letter-spacing: -0.4px;
      }

      .dashboard-placeholder__description {
        margin: 0;
        color: #242827;
        font-family: 'Roboto', sans-serif;
        font-size: 18px;
        font-weight: 400;
        line-height: 24px;
        letter-spacing: -0.1px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDashboardPageComponent {}
