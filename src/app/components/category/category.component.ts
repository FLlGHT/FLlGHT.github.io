import {Component, Input} from '@angular/core';
import {Color, COLORS} from "../../models/colors";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {

  @Input() category: any

  colorInfo(colorId: string) : Color | undefined {
    return COLORS.get(colorId)
  }

  categoryName(colorId: string) : string | undefined {
    let category = localStorage.getItem('color_' + colorId)
    return category ? category : this.colorInfo(colorId)?.name
  }

  colorStyle(colorId: string) : string {
    let color = this.colorInfo(colorId)
    return "background-color: " + color?.color
  }
}