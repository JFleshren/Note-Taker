document.addEventListener('DOMContentLoaded', () => {
  let noteForm;
  let noteTitle;
  let noteText;
  let saveNoteBtn;
  let newNoteBtn;
  let clearBtn; 

  console.log('DOMContentLoaded event triggered.');

  if (window.location.pathname === '/notes') {
    noteForm = document.querySelector('.note-form');
    noteTitle = document.querySelector('.note-title');
    noteText = document.querySelector('.note-textarea');
    saveNoteBtn = document.querySelector('.save-note');
    newNoteBtn = document.querySelector('.new-note');
    clearBtn = document.querySelector('.clear-btn');
    noteList = document.querySelectorAll('.list-container .list-group');

    console.log('Elements selected:', { noteForm, noteTitle, noteText, saveNoteBtn, newNoteBtn, clearBtn, noteList });

    if (saveNoteBtn) {
      console.log('Adding event listener to saveNoteBtn.');
      saveNoteBtn.addEventListener('click', handleNoteSave);
    } else {
      console.log('saveNoteBtn not found.');
    }

    if (newNoteBtn) {
      console.log('Adding event listener to newNoteBtn.');
      newNoteBtn.addEventListener('click', handleNewNoteView);
    } else {
      console.log('newNoteBtn not found.');
    }

    if (clearBtn) {
      console.log('Adding event listener to clearBtn.');
      clearBtn.addEventListener('click', renderActiveNote);
    } else {
      console.log('clearBtn not found.');
    }

    if (noteForm) {
      noteForm.addEventListener('input', handleRenderBtns);
    } else {
      console.log('Error: noteForm not found');
    }
  } else {
    console.log('Not on the /notes page');
  }
});

  // Function to show an element
  const show = (elem) => {
    elem.style.display = 'inline';
  };

  // Function to hide an element
  const hide = (elem) => {
    elem.style.display = 'none';
  };

  
  let activeNote = {};

  const getNotes = () =>
    fetch('/api/notes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

  const saveNote = (note) =>
    fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(note)
    });

  const deleteNote = (id) =>
    fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

  const renderActiveNote = () => {
    hide(saveNoteBtn);
    hide(clearBtn);

    if (activeNote.id) {
      show(newNoteBtn);
      noteTitle.setAttribute('readonly', true);
      noteText.setAttribute('readonly', true);
      noteTitle.value = activeNote.title;
      noteText.value = activeNote.text;
    } else {
      hide(newNoteBtn);
      noteTitle.removeAttribute('readonly');
      noteText.removeAttribute('readonly');
      noteTitle.value = '';
      noteText.value = '';
    }
  };

  // Function to save a note
  const handleNoteSave = () => {
    const newNote = {
      title: noteTitle.value,
      text: noteText.value
    };
    saveNote(newNote).then(() => {
      getAndRenderNotes();
      renderActiveNote(); 
    });
  };

  const handleNoteDelete = (e) => {
    e.stopPropagation();
  
    const deleteBtn = e.target.closest('.delete-note');
    if (!deleteBtn) {
      return; // If the delete button is not found, exit the function
    }
  
    const noteIdAttr = deleteBtn.parentElement.getAttribute('data-note');
    console.log('noteIdAttr:', noteIdAttr);
    const noteId = noteIdAttr ? JSON.parse(noteIdAttr).id : null;
    console.log('noteId:', noteId);
  
    if (activeNote.id === noteId) {
      activeNote = {};
    }
  
    deleteNote(noteId).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    });
  };

  const handleNoteView = (e) => {
    e.preventDefault();
    activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
    renderActiveNote();
  };

  const handleNewNoteView = (e) => {
    activeNote = {};
    show(clearBtn);
    renderActiveNote();
  };

  const handleRenderBtns = () => {
    show(clearBtn);
    if (!noteTitle.value.trim() && !noteText.value.trim()) {
      hide(clearBtn);
    } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
      hide(saveNoteBtn);
    } else {
      show(saveNoteBtn);
    }
  };

  const renderNoteList = async (notes) => {
    let jsonNotes = await notes.json();
    if (window.location.pathname === '/notes') {
      noteList.forEach((el) => (el.innerHTML = ''));
    }

    let noteListItems = [];

    const createLi = (text, delBtn = true) => {
      const liEl = document.createElement('li');
      liEl.classList.add('list-group-item');

      const spanEl = document.createElement('span');
      spanEl.classList.add('list-item-title');
      spanEl.innerText = text;
      spanEl.addEventListener('click', handleNoteView);

      liEl.append(spanEl);

      if (delBtn) {
        const delBtnEl = document.createElement('i');
        delBtnEl.classList.add(
          'fas',
          'fa-trash-alt',
          'float-right',
          'text-danger',
          'delete-note'
        );
        delBtnEl.addEventListener('click', handleNoteDelete);

        liEl.append(delBtnEl);
      }

      return liEl;
    };

    if (jsonNotes.length === 0) {
      noteListItems.push(createLi('No saved Notes', false));
    }

    jsonNotes.forEach((note) => {
      const li = createLi(note.title);
      li.dataset.note = JSON.stringify(note);

      noteListItems.push(li);
    });

    if (window.location.pathname === '/notes') {
      noteListItems.forEach((note) => noteList[0].append(note));
    }
  };

  const getAndRenderNotes = () => getNotes().then(renderNoteList);

  getAndRenderNotes();

