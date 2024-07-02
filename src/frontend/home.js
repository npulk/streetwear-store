import { Events } from './Events.js';
import { fetch } from './Server.js';

export class HomeView {
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

  #makeItem(task) {
    const li = document.createElement('li');
    li.classList.add('item');
    li.innerText = task.name;
    li.id = task.id;

    const button = document.createElement('button');
    button.innerText = 'Add to cart';
    //button.classList.add(''); eventually for styling

    button.addEventListener('click', async () => {
    //   await this.#events.publish('add-cart', item); can use later for stock management
      this.#addToCart(task.id);
    });

    li.appendChild(button);
    return li;
  }

  async #getItems() {
    const response = await fetch('/items');
    if (response.status === 200) {
      return this.#parse(response.body);
    } else {
      return [];
    }
  }

  async #addToCart(id) {
    await fetch('/cart', {
      method: 'POST',
      body: JSON.stringify(this.#items.find(item => item.id === id)),
    });
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
    const obj = JSON.parse(json);
    const items = obj.map(item => new Item(item.name, item.id));
    return items;
  }
}

class Item {
  constructor(name, id) {
    if (id === undefined) {
      this.id = Math.random().toString(36);
    } else {
      this.id = id;
    }
    this.name = name;
  }
}