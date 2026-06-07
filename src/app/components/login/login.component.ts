import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    
    this.loginForm = this.fb.group({
      username: ['admin', [Validators.required]],
      password: ['admin123', [Validators.required, Validators.minLength(4)]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    const val = this.loginForm.value;

    if (val.username === 'admin' && val.password === 'admin123') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', val.username);
      
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Username atau password salah ya. (Cobain: admin / admin123)';
    }
  }
}
