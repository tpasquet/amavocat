import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-dev-banner',
    template: `
        <div class="dev-banner" *ngIf="isDev">
            <span>🚧 ENVIRONNEMENT DE DÉVELOPPEMENT</span>
        </div>
    `,
    styles: [`
        .dev-banner {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            color: white;
            text-align: center;
            padding: 8px 16px;
            font-weight: bold;
            font-size: 14px;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            letter-spacing: 1px;
        }
        
        .dev-banner span {
            display: inline-block;
            animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `],
    standalone: false
})
export class DevBannerComponent {
    isDev = environment.dev;
}
