import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule,RouterLink,CommonModule]
})


export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],  
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        localStorage.removeItem('linajeGuardado'); 
        localStorage.setItem('token', res.token);
        this.router.navigate(['/main/inicio']);
      },
      error: err => {
        if (err.status === 404) {
          this.loginForm.get('email')?.setErrors({ notFound: true });
        } else if (err.status === 401) {
          this.loginForm.get('password')?.setErrors({ incorrect: true });
        } else {
          alert('Error al iniciar sesión. Inténtalo de nuevo.');
        }
      }
    });
  }
}