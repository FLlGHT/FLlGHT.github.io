import {Component, NgZone, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {FormControl, FormGroup} from "@angular/forms";
import {Stats} from "../../models/stats";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  events : Map<string, number> | undefined

  stats : Stats | undefined = undefined

  dateForm = new FormGroup({
    startDate: new FormControl(),
    endDate: new FormControl()
  });

  constructor(public authService: AuthService, private zone: NgZone) {

  }
  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth)
        this.loadEvents(new Date(), new Date())
      else
        this.events = undefined
    })
  }

  atStartOfDay(date: Date) : string {
    let start = new Date(date)
    start.setHours(0, 0, 0, 0)
    return start.toISOString()
  }

  atEndOfDay(date: Date) : string {
    let end = new Date(date)
    end.setHours(23, 59, 59, 999)
    return end.toISOString()
  }

  duration(from: Date, to: Date) : number {
    console.log('duration between ' + from + ' and ' + to)
    let difference = new Date(to).getTime() - new Date(from).getTime()
    console.log('diff is ' + difference)

    return Math.round(difference / 60000)
  }

  loadEvents(from: Date, to: Date) {
    this.authService.getGapi().client.calendar.events
      .list({
        calendarId: 'primary',
        timeMin: this.atStartOfDay(from),
        timeMax: this.atEndOfDay(to),
        singleEvents: true,
        orderBy: 'startTime',
      })
      .then((response: any) => {
        this.updateEvents(response)
        this.updateStats(from, to)
      });
  }

  updateEvents(response: any) {
    this.zone.run(() => {
      const events = response.result.items;
      let map = new Map()

      for (const event of events) {
        let name = event.summary;
        let duration = this.duration(event.start.dateTime, event.end.dateTime)
        let current = map.get(name) ? map.get(name) : 0
        map.set(name, current + duration)
      }

      this.events = new Map([...map.entries()].sort((firstEntry, secondEntry) => secondEntry[1] - firstEntry[1]))
    });
  }

  updateStats(from: Date, to: Date) {
    let productiveTime = 0

    if (this.events) {
      for (let [name, time] of this.events.entries()) {
        productiveTime += time
      }
    }

    let totalTime = this.duration(new Date(from), new Date(to))
    this.stats = {totalTime: totalTime, productiveTime: productiveTime, percentage: productiveTime / totalTime}
  }

  onSubmit() {
    let value = this.dateForm.value
    let from = value.startDate
    let to = value.endDate ? value.endDate : new Date()
    this.events = undefined

    this.loadEvents(from, to)
  }

  withoutComparison() {
    return 0
  }
}