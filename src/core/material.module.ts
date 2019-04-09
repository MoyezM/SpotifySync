import {NgModule} from "@angular/core";
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatToolbarModule,
  MatInputModule,
  MatProgressBarModule,
} from '@angular/material';


@NgModule({
  imports: [
    CommonModule, 
    MatButtonModule,  
    MatIconModule,
    MatToolbarModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  exports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatInputModule,
    MatProgressBarModule,
    ReactiveFormsModule
  ],
})
export class CustomMaterialModule { }