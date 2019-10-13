import { Component, OnInit, Inject, HostListener } from "@angular/core";
import { GlobalService } from "../../global.service";
import { ApiService } from "../../api.service";
import { User } from "../../models/user";
import { Subscription } from "rxjs/Subscription";
import { FormGroup, FormBuilder } from "@angular/forms";
import { DOCUMENT } from "@angular/platform-browser";
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  // baseurl = "http://localhost:8000";

  baseUrl = "http://35.224.46.100:8000/";
  files: any = [];
  userSub: Subscription;
  account: User = new User();
  form: FormGroup;
  next: string = "";

  constructor(
    private apiService: ApiService,
    private global: GlobalService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      user: [""]
    });
    this.userSub = this.global.user.subscribe(me => (this.account = me));
    this.global.me = JSON.parse(localStorage.getItem("account"));
    this.form.get("user").setValue(this.account.id);
    this.apiService.getImage().subscribe(
      res => {
        this.files = res["result"];
        this.next = res["next"];
        console.log(res);
      },
      err => {}
    );
    $(".gallery-list-item").click(function() {
      let value = $(this).attr("data-filter");
      if (value === "all") {
        $(".filter").show(300);
      } else {
        $(".filter")
          .not("." + value)
          .hide(300);
        $(".filter")
          .filter("." + value)
          .show(300);
      }
    });

    $(".gallery-list-item").click(function() {
      $(this)
        .addClass("active-item")
        .siblings()
        .removeClass("active-item");
    });
  }
  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    if (window.innerHeight + window.scrollY === document.body.scrollHeight) {
      this.apiService.getNextImage(this.next).subscribe(
        res => {
          Array.prototype.push.apply(this.files, res["result"]);
          this.next = res["next"];
          console.log(res["next"]);
        },
        err => {}
      );
    }
  }
}
