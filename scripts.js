import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1;
let matches = books;

class BookPreview extends HTMLElement {
    static get observedAttributes() {
        return ['bookdata']; // Observe changes to the bookData attribute
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    // Set bookData when the attribute changes
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'bookdata') {
            this.updateBookData(JSON.parse(newValue)); // Parse and update book data
        }
    }

    set bookData(data) {
        this.setAttribute('bookdata', JSON.stringify(data)); // Set attribute for book data
    }

    updateBookData({ author, id, image, title }) {
        this.shadowRoot.querySelector('.preview__image').src = image;
        this.shadowRoot.querySelector('.preview__title').innerText = title;
        this.shadowRoot.querySelector('.preview__author').innerText = authors[author];
        this.dataset.preview = id;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .preview {
                    width: 100%; /* Ensure the preview takes the full width */
                    height: 100px; /* Set a fixed height for uniformity */
                    display: flex; /* Use flexbox for layout */
                    align-items: center;
                    cursor: pointer;
                    text-align: left;
                    border-radius: 8px;
                    border: 1px solid rgba(var(--color-dark), 0.15);
                    background: rgba(var(--color-light), 1);
                    margin: 0.5rem; /* Add margin for spacing between previews */
                }
                .preview__image {
                    width: 48px;
                    height: 70px;
                    object-fit: cover;
                    background: grey;
                    border-radius: 2px;
                }
                .preview__info {
                    padding: 1rem;
                    flex-grow: 1; /* Allow info to take remaining space */
                }
                .preview__title {
                    margin: 0 0 0.5rem;
                    font-weight: bold;
                    color: rgba(var(--color-dark), 0.8);
                }
                .preview__author {
                    color: rgba(var(--color-dark), 0.4);
                }
            </style>
            <div class="preview">
                <img class="preview__image" src="" alt="Book Cover" />
                <div class="preview__info">
                    <h3 class="preview__title"></h3>
                    <div class="preview__author"></div>
                </div>
            </div>
        `;
    }
}

customElements.define('book-preview', BookPreview);

// Function to create a button element for a book
function createBookButton(book) {
    const element = document.createElement('book-preview');
    element.bookData = book; // Set the book data
    element.addEventListener('click', () => {
        // Handle click event to show book details
        const bookDetails = books.find(singleBook => singleBook.id === book.id);
        if (bookDetails) {
            document.querySelector('[data-list-active]').open = true;
            document.querySelector('[data-list-blur]').src = bookDetails.image;
            document.querySelector('[data-list-image]').src = bookDetails.image;
            document.querySelector('[data-list-title]').innerText = bookDetails.title;
            document.querySelector('[data-list-subtitle]').innerText = `${authors[bookDetails.author]} (${new Date(bookDetails.published).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = bookDetails.description;
        }
    });
    return element;
}

// Function to render book previews
function renderBookPreviews(bookList) {
    const fragment = document.createDocumentFragment();
    for (const book of bookList.slice(0, BOOKS_PER_PAGE)) {
        fragment.appendChild(createBookButton(book));
    }
    document.querySelector('[data-list-items]').appendChild(fragment);
}

// Function to create genre options
function createGenreOptions() {
    const genreHtml = document.createDocumentFragment();
    const firstGenreElement = document.createElement('option');
    firstGenreElement.value = 'any';
    firstGenreElement.innerText = 'All Genres';
    genreHtml.appendChild(firstGenreElement);

    for (const [id, name] of Object.entries(genres)) {
        const element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        genreHtml.appendChild(element);
    }
    document.querySelector('[data-search-genres]').appendChild(genreHtml);
}

// Function to create author options
function createAuthorOptions() {
    const authorsHtml = document.createDocumentFragment();
    const firstAuthorElement = document.createElement('option');
    firstAuthorElement.value = 'any';
    firstAuthorElement.innerText = 'All Authors';
    authorsHtml.appendChild(firstAuthorElement);

    for (const [id, name] of Object.entries(authors)) {
        const element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        authorsHtml.appendChild(element);
    }
    document.querySelector('[data-search-authors]').appendChild(authorsHtml);
}

// Function to set theme based on user preference or provided theme
function setTheme(theme) {
    // Determine if dark mode should be applied
    const isDarkMode = theme === 'night';
    
    // Update the theme selector value
    document.querySelector('[data-settings-theme]').value = isDarkMode ? 'night' : 'day';

    // Set CSS variables for colors based on the applied theme
    document.documentElement.style.setProperty('--color-dark', isDarkMode ? '255, 255, 255' : '10, 10, 20'); // Background color for dark mode
    document.documentElement.style.setProperty('--color-light', isDarkMode ? '10, 10, 20' : '255, 255, 255'); // Background color for light mode

    // Additional styles for light mode
    if (!isDarkMode) {
        document.body.style.backgroundColor = 'white'; // Set body background to white for light mode
        document.body.style.color = 'black'; // Set text color to black for light mode
    } else {
        document.body.style.backgroundColor = 'black'; // Set body background to black for dark mode
        document.body.style.color = 'white'; // Set text color to white for dark mode
    }
}

// Initial theme setting based on user preference or default
setTheme('day'); // Set default theme to 'day'

// Function to update the "Show more" button
function updateShowMoreButton() {
    const remaining = matches.length - (page * BOOKS_PER_PAGE);
    const button = document.querySelector('[data-list-button]');
    button.innerHTML = `<span>Show more</span><span class="list__remaining"> (${remaining > 0 ? remaining : 0})</span>`;
    button.disabled = remaining < 1;
}

// Initial rendering of books and options
renderBookPreviews(matches);
createGenreOptions();
createAuthorOptions();
setTheme();
updateShowMoreButton();

// Event listeners for various UI interactions
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
});

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true;
});

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false;
});

// Event listener for settings form submission
document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    setTheme(theme); // Pass the selected theme to setTheme
    document.querySelector('[data-settings-overlay]').open = false;
});

// Event listener for search form submission
document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;
        return genreMatch && titleMatch && authorMatch;
    });

    page = 1;
    matches = result;
    document.querySelector('[data-list-message]').classList.toggle('list__message_show', result.length < 1);
    document.querySelector('[data-list-items]').innerHTML = '';
    renderBookPreviews(result);
    updateShowMoreButton();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
});

// Event listener for "Show more" button
document.querySelector('[data-list-button]').addEventListener('click', () => {
    renderBookPreviews(matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE));
    page += 1;
});

// Event listener for book item click
document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    const active = pathArray.find(node => node?.dataset?.preview);
    if (active) {
        const book = books.find(singleBook => singleBook.id === active.dataset.preview);
        if (book) {
            document.querySelector('[data-list-active]').open = true;
            document.querySelector('[data-list-blur]').src = book.image;
            document.querySelector('[data-list-image]').src = book.image;
            document.querySelector('[data-list-title]').innerText = book.title;
            document.querySelector('[data-list-subtitle]').innerText = `${authors[book.author]} (${new Date(book.published).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = book.description;
        }
    }
});