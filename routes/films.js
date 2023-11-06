const express = require('express');
const { serialize, parse } = require('../utils/json');

const router = express.Router();

const jsonDbPath = `${__dirname}/../data/films.json`;

const FILMS = [
  {
    id: 1,
    title: 'Harry Potter',
    duration: 89,
    budget: 500000,
    link: 'https://www.imdb.com/title/tt0241527/?ref_=nv_sr_srsg_0_tt_8_nm_0_q_harry%2520pot',
  },
  {
    id: 2,
    title: 'Fast and Furius',
    duration: 89,
    budget: 1000000,
    link: 'https://www.imdb.com/title/tt5433138/?ref_=fn_al_tt_2',
  },
  {
    id: 3,
    title: 'Power',
    duration: 1231,
    budget: 2000000,
    link: 'https://www.imdb.com/title/tt3281796/?ref_=nv_sr_srsg_0_tt_7_nm_1_q_Power',
  },
];

/* GET home page. */
// eslint-disable-next-line consistent-return
router.get('/', (req, res) => {
  const film = parse(jsonDbPath, FILMS);

  const minimumFilmDuration = req?.query?.['minimum-duration']
    ? Number(req.query['minimum-duration'])
    : undefined; // si la premiere partie est true alors la variable minimumDurationFilm est egale à la deuxiemem partie( celle après le point d'interrogation) sinon elle est undifined
  if (minimumFilmDuration <= 0) return res.sendStatus(400);

  // eslint-disable-next-line no-restricted-globals
  if (minimumFilmDuration === undefined || isNaN(minimumFilmDuration)) return res.json(film);

  const filmsReachingMinimumDuration = film.filter(
    // eslint-disable-next-line no-shadow
    (film) => film.duration >= minimumFilmDuration,
  );

  res.json(filmsReachingMinimumDuration);
});

// Read the film identified by an id in the FILMS
// eslint-disable-next-line consistent-return
router.get('/:id', (req, res) => {
  const film = parse(jsonDbPath, FILMS);

  // eslint-disable-next-line eqeqeq, no-shadow
  const indexOfFilmFound = film.findIndex((film) => film.id == req.params.id);

  if (indexOfFilmFound < 0) return res.sendStatus(404);

  res.json(film[indexOfFilmFound]);
});

// CREATION new film
// eslint-disable-next-line consistent-return
router.post('/', (req, res) => {
  const title = req?.body?.title?.trim()?.length !== 0 ? req.body.title : undefined;
  const link = req?.body?.link?.trim()?.length !== 0 ? req.body.link : undefined;

  const duration =
    typeof req?.body?.duration === 'number' || req.body.duration < 0
      ? req.body.duration
      : undefined;
  const budget =
    typeof req?.body?.budget === 'number' || req.body.budget < 0 ? req.body.budget : undefined;

  const titleOfFilm = req?.body?.title;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < FILMS.length; i++) {
    if (FILMS[i].title === titleOfFilm) return res.sendStatus(409);
  }

  const film = parse(jsonDbPath, FILMS);
  const lastItemIndex = film?.length !== 0 ? film.length - 1 : undefined;
  const lastId = lastItemIndex !== undefined ? film[lastItemIndex]?.id : 0;
  const nextId = lastId + 1;

  const newFilm = {
    id: nextId,
    title,
    duration,
    budget,
    link,
  };

  film.push(newFilm);

  serialize(jsonDbPath, film); // serialize pour faire persister les donnée et , jsondbPath pour signaler où et film pour dire quel élément à été modifié

  // eslint-disable-next-line no-undef
  res.json(film[nextId - 1]);
});

// DELETE one
// eslint-disable-next-line consistent-return
router.delete('/:id', (req, res) => {
  const film = parse(jsonDbPath, FILMS);

  // eslint-disable-next-line no-shadow
  const id = film.findIndex((film) => film.id === req.params.id);

  if (id < 0) return res.sendStatus(404);

  const itemsRemovedFromFILMS = film.splice(id, 1); // ypourquoi mettre le 1 aussi ??
  const itemRemoved = itemsRemovedFromFILMS[0];

  serialize(jsonDbPath, film);

  res.json(itemRemoved);
});

// Update a pizza based on its id and new values for its parameters
// eslint-disable-next-line consistent-return
router.patch('/:id', (req, res) => {
  const film = parse(jsonDbPath, FILMS); // charger tte les données dans une mémoire vive

  const title = req?.body?.title;
  const content = req?.body?.content;

  if ((!title && !content) || title?.length === 0 || content?.length === 0)
    return res.sendStatus(400);

  const foundIndex = film.findIndex((films) => films.id === req.params.id);

  if (foundIndex < 0) return res.sendStatus(404);

  const updatedPizza = { ...film[foundIndex], ...req.body };

  film[foundIndex] = updatedPizza;

  serialize(jsonDbPath, film);

  res.json(updatedPizza);
});

// eslint-disable-next-line consistent-return
router.put('/:id', (req, res) => {
  const newId = req?.body?.title;
  const newTitle = req?.body?.title;
  const newDuration = req?.body?.duration;
  const newBudget = req?.body?.budget;
  const newLink = req?.body?.link;

  if (!newTitle || !newDuration || !newBudget || !newLink) return res.sendStatus(400);

  const foundID = FILMS.findIndex((films) => films.id === req.params.id);

  if (foundID < 0) {
    const newFilm = { newId, newTitle, newDuration, newBudget, newLink };
    FILMS.push(newFilm);
    return res.json(newFilm);
  }

  const filmPriorToChange = FILMS[foundID];
  const objectContainingPropertiesToBeUpdated = req.body;

  const updatedFilm = {
    ...filmPriorToChange,
    ...objectContainingPropertiesToBeUpdated,
  };

  FILMS[foundID] = updatedFilm;

  res.json(updatedFilm);
});

module.exports = router;
