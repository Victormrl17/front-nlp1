import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule,RouterLink,CommonModule]
})


export class RegisterComponent {
  registerForm: FormGroup;
  serverError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    this.serverError = null;
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => {
        const msg = err.error?.message?.toLowerCase() || '';
        
        if (err.status === 400 && err.error?.missing) {
          err.error.missing.forEach((field: string) => {
            this.registerForm.get(field)?.setErrors({ required: true });
          });
        } else if (err.status === 409) {
          if (msg.includes('email')) {
            this.registerForm.get('email')?.setErrors({ exists: true });
          }
          if (msg.includes('usuario')) {
            this.registerForm.get('username')?.setErrors({ exists: true });
          }
        } else {
          this.serverError = 'Error inesperado. Intenta más tarde.';
        }
      }
    });

  }
}
