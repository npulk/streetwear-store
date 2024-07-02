import { Events } from './Events.js';
import { fetch } from './Server.js';
import { Item } from './home.js';

export class CartView {
  constructor() {}

  async render() {
    // Create the root element
    // const todoListViewElm = document.createElement('div');
    // todoListViewElm.id = 'todo-list-view';

    // const titleElm = document.createElement('h1');
    // titleElm.innerText = 'Todo List';

    const itemListContainerElm = document.createElement('div');
    itemListContainerElm.id = 'item-list-container';

    // Create a TodoList component and append it to the root element
    const items = new ItemList();
    itemListContainerElm.appendChild(await items.render());

    // Append the todolist container element to the view

    return itemListContainerElm;
  }
}

// class ItemList {
//   constructor() {}

//   async render() {
//     // Create the root element
//     const ItemListElm = document.createElement('div');
//     ItemListElm.id = 'item-list';

//     // Render the text input and task list
//     const itemList = new ItemList();
//     const itemListElm = await itemList.render();

//     // Append the text input and task list to the root element

//     return itemListElm;
//   }
// }


class ItemList {
  #events = null;
  #items = null;
  #list = null;

  constructor() {
    this.#events = Events.events();
  }

  async render() {
    if (this.#items === null) {
      this.#items = await this.#getItems();
    }

    const itemListElm = document.createElement('div');
    itemListElm.id = 'item-list';

    this.#list = document.createElement('ul');
    const listItems = this.#items.map(item => this.#makeItem(item));

    listItems.forEach(li => this.#list.appendChild(li));

    itemListElm.appendChild(this.#list);

    // this.#events.subscribe('add-cart', item => {
    //   const li = this.#makeItem(task);
    //   this.#list.appendChild(li);
    // });

    return itemListElm;
  }

  #makeItem(item) {
    const li = document.createElement('li');
    li.classList.add('item');
    li.innerText = item.name;
    li.id = item.id;

    const button = document.createElement('button');
    button.innerText = 'Remove from cart';
    //button.classList.add(''); eventually for styling

    button.addEventListener('click', async () => {
    //   await this.#events.publish('add-cart', item); can use later for stock management
        this.#removeFromCart(item.id);
        this.#removeListItem(item.id);
        this.render();
    });

    li.appendChild(button);
    return li;
  }

  async #getItems() {
    const response = await fetch('/cart');
    if (response.status === 200) {
      return this.#parse(response.body);
    } else {
      return [];
    }
  }

  async #removeFromCart(id) {
    await fetch('/cart', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  #removeListItem(id) {
    const li = this.#list.querySelector(`li[data-id='${id}']`);
    if (li) {
      this.#list.removeChild(li);
    } else {
      console.error(`Item with id ${id} not found in the list.`);
    }
  }

//   async #deleteTask(id) {
//     const task = this.#items.find(task => task.id === id);
//     if (task) {
//         await this.#archiveTask(task); 
//     }
//     await fetch('/tasks', {
//         method: 'DELETE',
//         body: id,
//     });
// }

   #parse(json) {
    let obj;
    try {
        obj = JSON.parse(json);
        console.log(obj);
        console.log(json);
    } catch (e) {
        console.error("Invalid JSON:", e);
        return [];
    }

    if (!Array.isArray(obj)) {
        console.error("Parsed JSON is not an array");
        return [obj];
    }

    console.log(obj);
    const items = obj.map(item => new Item(item.name, item.id));
    return items;
    }
}
// class ItemList {
//   constructor(name, id) {
//     if (id === undefined) {
//       this.id = Math.random().toString(36);
//     } else {
//       this.id = id;
//     }
//     this.name = name;
//   }
// }