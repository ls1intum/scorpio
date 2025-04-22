import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  ViewChild,
  effect,
  input,
} from "@angular/core";

@Component({
  selector: "app-pet",
  imports: [],
  templateUrl: "./pet.component.html",
  styleUrl: "./pet.component.css",
})
export class PetComponent implements AfterViewInit {
  @ViewChild("pet") petRef!: ElementRef<HTMLImageElement>;
  petImageUrl = (window as any).petImageUrl;

  visible = input.required<boolean>();
  private animationFrameId: number = 0;

  private readonly minSpeed = 0.04;
  private readonly maxSpeed = 0.2;
  private speed = this.randomSpeed();

  private readonly minDirectionChangePause = 1500;
  private readonly maxDirectionChangePause = 3000;
  private directionChangePause = this.randomDirectionPause();

  private clockwise = 1;
  private edge: "bottom" | "right" | "top" | "left" = "bottom";
  private pos = { x: 0, y: 0 };

  private boundaries = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  @HostListener("window:resize")
  onResize() {
    if (!this.visible()) {
      return;
    }

    this.updateBoundaries();
  }

  constructor(private renderer: Renderer2) {
    effect(() => {
      if (this.visible()) {
        this.showPet();
      } else if (!this.visible()) {
        this.hidePet();
      }
    });
  }

  ngAfterViewInit(): void {
    // make sure that boundaries are correct after image was loaded
    const pet = this.petRef.nativeElement;
    this.renderer.listen(pet, "load", () => {
      this.updateBoundaries();
    });

    if (pet.complete) {
      this.updateBoundaries();
    }
  }

  showPet() {
    this.updateBoundaries();
    this.animationFrameId = requestAnimationFrame((timestamp) => this.animate(timestamp));
  }

  private lastTimeStamp?: number;
  animate(timestamp: number) {
    const delta = this.lastTimeStamp ? timestamp - this.lastTimeStamp : 0;
    this.lastTimeStamp = timestamp;
    this.move(delta);
    this.changeDirection(delta);
    this.animationFrameId = requestAnimationFrame((timestamp) => this.animate(timestamp));
  }

  hidePet() {
    cancelAnimationFrame(this.animationFrameId);
    this.lastTimeStamp = undefined;
  }

  updateBoundaries() {
    const pet = this.petRef.nativeElement;
    this.boundaries.left = 0;
    this.boundaries.right = window.innerWidth - pet.offsetWidth;
    this.boundaries.top = window.innerHeight - pet.offsetHeight + 8;
    this.boundaries.bottom = 0;

    if (this.edge === "bottom") {
      this.setPosition(this.pos.x, this.boundaries.bottom);
    } else if (this.edge === "right") {
      this.setPosition(this.boundaries.right, this.pos.y);
    } else if (this.edge === "top") {
      this.setPosition(this.pos.x, this.boundaries.top);
    } else if (this.edge === "left") {
      this.setPosition(this.boundaries.left, this.pos.y);
    }
  }

  move(delta: number) {
    if (this.speed === 0) return;

    const normalizedSpeed = this.speed * delta;

    const pet = this.petRef.nativeElement;

    switch (this.edge) {
      case "bottom":
        this.pos.x += normalizedSpeed * this.clockwise;
        this.pos.y = this.boundaries.bottom;
        if (this.pos.x > this.boundaries.right) {
          this.edge = "right";
          this.pos.x = this.boundaries.right;
          pet.style.transform = `rotate(-90deg) scaleX(${this.clockwise})`;
        } else if (this.pos.x < this.boundaries.left) {
          this.edge = "left";
          this.pos.x = this.boundaries.left;
          pet.style.transform = `rotate(90deg) scaleX(${this.clockwise})`;
        }
        break;
      case "right":
        this.pos.y += normalizedSpeed * this.clockwise;
        this.pos.x = this.boundaries.right;
        if (this.pos.y > this.boundaries.top) {
          this.edge = "top";
          this.pos.y = this.boundaries.top;
          pet.style.transform = `rotate(180deg) scaleX(${this.clockwise})`;
        } else if (this.pos.y < this.boundaries.bottom) {
          this.edge = "bottom";
          this.pos.y = this.boundaries.bottom;
          pet.style.transform = `rotate(0deg) scaleX(${this.clockwise})`;
        }
        break;
      case "top":
        this.pos.x -= normalizedSpeed * this.clockwise;
        this.pos.y = this.boundaries.top;
        if (this.pos.x < this.boundaries.left) {
          this.edge = "left";
          this.pos.x = this.boundaries.left;
          pet.style.transform = `rotate(90deg) scaleX(${this.clockwise})`;
        } else if (this.pos.x > this.boundaries.right) {
          this.edge = "right";
          this.pos.x = this.boundaries.right;
          pet.style.transform = `rotate(-90deg) scaleX(${this.clockwise})`;
        }
        break;
      case "left":
        this.pos.y -= normalizedSpeed * this.clockwise;
        this.pos.x = this.boundaries.left;
        if (this.pos.y < this.boundaries.bottom) {
          this.edge = "bottom";
          this.pos.y = this.boundaries.bottom;
          pet.style.transform = `rotate(0deg) scaleX(${this.clockwise})`;
        } else if (this.pos.y > this.boundaries.top) {
          this.edge = "top";
          this.pos.y = this.boundaries.top;
          pet.style.transform = `rotate(180deg) scaleX(${this.clockwise})`;
        }
        break;
    }

    this.setPosition(this.pos.x, this.pos.y);
  }

  passedTimeSinceLastDirectionChange = 0;
  changeDirection(delta: number) {
    this.passedTimeSinceLastDirectionChange += delta;
    if (this.passedTimeSinceLastDirectionChange < this.directionChangePause) {
      return;
    }
    this.passedTimeSinceLastDirectionChange = 0;
    this.directionChangePause = this.randomDirectionPause();

    const pet = this.petRef.nativeElement;
    // 50% chance to pause
    if (Math.random() < 0.5) {
      // 50% chance to change direction
      const turn = Math.random() < 0.5 ? -1 : 1;
      this.clockwise *= turn;
      this.speed = this.randomSpeed();
      pet.style.transform = `${pet.style.transform} scaleX(${turn})`;
    } else {
      this.speed = 0;
    }
  }

  setPosition(x: number, y: number) {
    const pet = this.petRef.nativeElement;
    pet.style.left = `${x}px`;
    pet.style.bottom = `${y}px`;
  }

  randomSpeed(): number {
    const tmp = Math.random() * (this.maxSpeed - this.minSpeed) + this.minSpeed;
    return tmp;
  }

  randomDirectionPause(): number {
    return (
      Math.random() * (this.maxDirectionChangePause - this.minDirectionChangePause) +
      this.minDirectionChangePause
    );
  }
}
