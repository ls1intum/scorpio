import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { LoginComponent } from "./login/login.component";
import { CourseSelectionComponent } from "./course/course-selection.component";
import { ExerciseSelectionComponent } from "./exercise/exercise-selection.component";
import { ProblemStatementComponent } from "./problem-statement/problem-statement.component";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CourseSelectionComponent,
    ExerciseSelectionComponent,
    ProblemStatementComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
