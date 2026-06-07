import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      <div class="text-center max-w-md flex flex-col items-center gap-6">
        
        <!-- Big Animated Number -->
        <div class="relative">
          <h1 class="text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 animate-pulse">
            404
          </h1>
          <div class="absolute inset-0 bg-cyan-500/10 blur-xl rounded-full scale-75 animate-ping"></div>
        </div>

        <!-- Warning Icon & Heading -->
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl animate-bounce">
            <i class="fa fa-exclamation-triangle"></i>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-white mt-2">
            Page Not Found
          </h2>
        </div>

        <!-- Description -->
        <p class="text-slate-400 text-sm leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <!-- Back Button -->
        <a routerLink="/employees" 
           class="btn bg-[#0091cb] hover:bg-[#007ba8] text-white font-bold py-2.5 px-6 rounded transition-all active:scale-95 text-sm shadow-lg shadow-cyan-950/50 focus:outline-none">
          Back to Dashboard
        </a>
      </div>
    </div>
  `
})
export class NotFoundComponent {
  constructor(private router: Router) {}
}
