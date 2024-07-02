
import { Events } from './Events.js';
import { HomeView } from './home.js';


export class App {
  #homeViewElm = null;
  #mainViewElm = null;
  #events = null;

  constructor() {
    this.#events = Events.events();
  }

  async render(root) {
    const rootElm = document.getElementById(root);
    rootElm.innerHTML = '';

    //I am creating all of these elements here rather than in a navbar.js file as there are only 3 constant links that will not change for navigation
    const loginLinkContainer = document.createElement('div');
    const loginLink = document.createElement('a');
    loginLink.href = '#login';
    loginLink.innerText = 'Login/User';
    loginLink.classList.add('button');
    loginLink.id = 'loginButton';
    loginLinkContainer.appendChild(loginLink);

    const cartLinkContainer = document.createElement('div');
    const cartLink = document.createElement('a');
    cartLink.href = '#cart';
    cartLink.innerText = 'Cart/Checkout';
    cartLink.classList.add('button');
    cartLink.id = 'cartButton';
    cartLinkContainer.appendChild(cartLink);

    const homeContainer = document.createElement('div');
    homeContainer.classList.add('header-container');
    const homeHeader = document.createElement('h1');
    homeHeader.classList.add('home-header');
    const homeLink = document.createElement('a');
    homeLink.href = '#home';
    homeLink.innerText = 'Brand Name Here';
    homeContainer.appendChild(homeHeader);
    homeHeader.appendChild(homeLink);


    rootElm.appendChild(loginLinkContainer);
    rootElm.appendChild(homeContainer);
    rootElm.appendChild(cartLinkContainer);

    const links = rootElm.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', async e => {
          // Prevent the default anchor tag behavior
          e.preventDefault();
  
          // Get the view name from the href attribute
          const view = e.target.getAttribute('href').replace('#', '');
  
          // Update the window's hash to reflect the current view
          window.location.hash = view;
  
          // Call the navigateTo function with the view name
          await this.#events.publish('navigateTo', view);
        });
      });

    // Get all the anchor tags within the <div> element

    this.#mainViewElm = document.createElement('div');
    this.#mainViewElm.id = 'main-view';

    rootElm.appendChild(this.#mainViewElm)

    // const archiveListView = new ArchiveView(); new view will go here
    // this.#archivelistViewElm = await archiveListView.render();

    const homeView = new HomeView();
    this.#homeViewElm = await homeView.render();
    this.#navigateTo('home');

    this.#events.subscribe('navigateTo', view => this.#navigateTo(view));

  }

  #navigateTo(view) {
    this.#mainViewElm.innerHTML = '';
    if (view === 'home') {
      this.#mainViewElm.appendChild(this.#homeViewElm);
      window.location.hash = view;
    } else if (view === 'login') {
      // TODO: this is where we want to add the archive view
    //   this.#mainViewElm.appendChild(this.#archivelistViewElm);
    //   window.location.hash = view;
    } else {
      this.#mainViewElm.appendChild(this.todolist);
      window.location.hash = 'home';
    }
  }
}
