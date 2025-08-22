export const memeGifs = [
  'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
  'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
  'https://media.giphy.com/media/13HBDT4QSTpveU/giphy.gif'
]
export const pickMeme = () => memeGifs[Math.floor(Math.random() * memeGifs.length)]
