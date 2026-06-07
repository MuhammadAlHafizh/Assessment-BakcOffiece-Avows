import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
      <div class="text-center max-w-md flex flex-col items-center gap-6">
        
        <!-- Big Animated Number -->
        <div class="relative">
          <h1 class="text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-600 animate-pulse">
            500
          </h1>
          <div class="absolute inset-0 bg-rose-500/10 blur-xl rounded-full scale-75 animate-ping"></div>
        </div>

        <!-- Warning Icon & Heading -->
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 rounded-full bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl animate-spin" style="animation-duration: 4s;">
            <i class="fa fa-cog"></i>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-white mt-2">
            Internal Server Error
          </h2>
        </div>

        <!-- Description -->
        <p class="text-slate-400 text-sm leading-relaxed">
          Whoops! Something went wrong on our end. Our servers are having a hiccup. Please try again later.
        </p>

        <!-- Back Button -->
        <a routerLink="/employees" 
           class="btn bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-6 rounded transition-all active:scale-95 text-sm shadow-lg shadow-rose-950/50 focus:outline-none">
          Back to Dashboard
        </a>
      </div>
    </div>
  `
})
export class ServerErrorComponent {
  constructor(private router: Router) {}
}
