import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl = '/dashboard';

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Connexion réussie', response);
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error('Erreur de connexion', error);

          if (error.status === 401) {
            this.errorMessage = 'Email ou mot de passe incorrect';
          } else {
            this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
          }
        }
      });
  }
}
