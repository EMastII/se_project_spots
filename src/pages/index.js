import "./index.css";
import {
  enableValidation,
  settings,
  showInputError,
  hideInputError,
  checkInputValidity,
  hasInvalidInput,
  disableButton,
  toggleButtonState,
  resetValidation,
  setEventListeners,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";
import { setButtonText } from "../utils/helpers.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "09489a73-8599-4197-b350-e3a729766075",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, user]) => {
    cards.forEach((item) => {
      const cardEl = getCardElement(item);
      cardsList.append(cardEl);
    });
    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    profileAvatar.src = user.avatar;
  })
  .catch(console.error);

const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input",
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input",
);
const avatarModalBtn = document.querySelector(".profile__avatar-btn");

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const newPostNameInput = document.querySelector("#card-caption-input");
const newPostLinkInput = document.querySelector("#card-image-input");
const addCardFormElement = newPostModal.querySelector(".modal__form");
const newPostSaveBtn = newPostModal.querySelector(".modal__save-btn");

const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaption = previewModal.querySelector(".modal__caption");

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

const profileAvatar = document.querySelector(".profile__avatar");
const profileAvatarBtn = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#edit-avatar-modal");
const editAvatarCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#avatar-name-input");
const profileAvatarForm = document.querySelector("#profile__avatar-form");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form-delete");

let selectedCard, selectedCardId;

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

previewModalCloseBtn.addEventListener("click", () => closeModal(previewModal));

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");
  if (data.isLiked) {
    cardLikeBtnEl.classList.add("card__like-btn_active");
  }
  cardLikeBtnEl.addEventListener("click", (evt) => handleLike(evt, data._id));
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");
  cardDeleteBtnEl.addEventListener("click", (evt) =>
    handleDeleteCard(cardElement, data._id),
  );

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewCaption.textContent = data.name;
    previewImageEl.alt = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function closeOnEsc(event) {
  if (event.key !== "Escape") return;

  if (newPostModal.classList.contains("modal_is-opened")) {
    closeModal(newPostModal);
  } else if (previewModal.classList.contains("modal_is-opened")) {
    closeModal(previewModal);
  } else {
    closeModal(editProfileModal);
  }
}

function closeOnOverlay(event) {
  if (event.target === event.currentTarget) {
    closeModal(event.target);
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", closeOnEsc);
  modal.addEventListener("click", closeOnOverlay);
}
function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", closeOnEsc);
  modal.removeEventListener("click", closeOnOverlay);
}
editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileDescriptionInput],
    settings,
  );
  openModal(editProfileModal);
});
editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});
newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});
newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});
editAvatarCloseBtn.addEventListener("click", function () {
  closeModal(avatarModal);
});
profileAvatarBtn.addEventListener("click", function () {
  openModal(avatarModal);
});
profileAvatarForm.addEventListener("submit", function () {
  handleAvatarSubmit;
});

deleteForm.addEventListener("submit", handleDeleteSubmit);

function handleLike(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-btn_active");
  api
    .handleLike(id, isLiked)
    .then((updatedCardData) => {
      evt.target.classList.toggle("card__like-btn_active");
    })
    .catch((err) => {
      console.error(`Error updating like status: ${err}`);
    });
}

function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, true);
      submitBtn.textContent = "Save";
    });
}

//implement loading text for other form submissions.

editProfileForm.addEventListener("submit", handleEditProfileSubmit);

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  console.log(evt.target);
  api
    .postNewCard({
      name: evt.target.caption.value,
      link: evt.target.description.value,
    })
    .then((data) => {
      const cardElement = getCardElement(data);
      cardsList.prepend(cardElement);
      closeModal(newPostModal);
      closeModal(addCardFormElement);
      addCardFormElement.reset();
      // disableButton(newPostSaveBtn, settings); => .finally()
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;

      closeModal(avatarModal);
    })
    .catch(console.error);
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error);
}

addCardFormElement.addEventListener("submit", handleAddCardSubmit);

enableValidation(settings);
