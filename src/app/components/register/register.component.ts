import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  //  RÔLES ALIGNÉS BACKEND
  roles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'CLIENT', label: 'Client' },
    { value: 'LIVREUR', label: 'Livreur' }
  ];

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['CLIENT', Validators.required],
      vehicule: ['']
    }, {
      validators: this.passwordMatchValidator
    });

    // Gestion dynamique LIVREUR
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const vehiculeCtrl = this.registerForm.get('vehicule');

      if (role === 'LIVREUR') {
        vehiculeCtrl?.setValidators(Validators.required);
      } else {
        vehiculeCtrl?.clearValidators();
        vehiculeCtrl?.reset();
      }

      vehiculeCtrl?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  isLivreur(): boolean {
    return this.registerForm.get('role')?.value === 'LIVREUR';
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const formValue = this.registerForm.value;

    // ✅ PAYLOAD IDENTIQUE À POSTMAN
    const payload: any = {
      nom: formValue.nom,
      prenom: formValue.prenom,
      email: formValue.email,
      telephone: formValue.telephone,
      adresse: formValue.adresse,
      password: formValue.password,
      role: formValue.role
    };

    // Ajouter UNIQUEMENT si LIVREUR
    if (formValue.role === 'LIVREUR') {
      payload.vehicule = formValue.vehicule;
    }

    console.log('Payload envoyé au backend:', payload);

    this.authService.register(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.successMessage = 'Inscription réussie !';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (error) => {
          console.error('Erreur inscription', error);

          if (error.status === 409) {
            this.errorMessage = 'Cet email est déjà utilisé';
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Erreur serveur. Veuillez réessayer.';
          }
        }
      });
  }
}
