# Scorpio: A VSCode Extension for the Interactive Learning Platform [Artemis](https://github.com/ls1intum/Artemis)

Scorpio is an IDE-integrated Visual Studio Code plugin for the online learning platform Artemis. The plugin seamlessly incorporates the entire programming exercise life cycle directly within the student's IDE. It enables the student to start the programming exercise, displays the instructions, offers the option to submit the exercise, and returns the submission results all within the IDE.

## Features

### Seamless Authentication
The plugin allows the student to authenticate to Artemis. The authentication includes two independent authentication options. 
1. the login process within the local IDE
2. the automatic authentication of the student in the online IDE Theia Cloud without a redundant login process

![](.github/media/scorpio_login.gif)

### Exercise Start
The student can start the exercise from with the IDE. The exercise repository is then automatically cloned into the corresponding workspace. 

![](.github/media/course_selection.gif)

![](.github/media/cloning.gif)


### Problem Statement
The plugin displays the problem statement within the IDE. The problem statement related to the exercise repository, currently open in the student's workspace, is displayed. The problem statement can be composed of text and UML diagrams.



### Exercise Submission
The plugin allows the students to submit the exercise directly within the IDE. The submission leads to the synchronization of the student's workspace and the exercise repository and triggers the automatic assessment of the student's submission.

![](.github/media/submit.gif)


### Feedback Display
The plugin displays submission feedback within the IDE. The feedback can either be displayed inside the textual part of the problem statement or within the UML diagrams. This should enable the student to get instant submission feedback and aid the solving process.

![](.github/media/results.gif)


## Extension Settings

* `scorpio.artemis.apiBaseUrl`: Specifies the base URL of the Artemis API. Default value is `https://artemis.ase.in.tum.de`

## Development
[Developer Guide](README_DEVELOPER.md)