## CFB Math

With all the [recent controversy](https://www.espn.com/college-football/story/_/id/39041535/college-football-playoff-committee-selection-process-florida-state-alabama-texas) surrounding the college football playoffs, I thought it might be fun to crunch my own numbers just to see what results I get.

I added several popular rating systems such as [Elo](https://en.wikipedia.org/wiki/Elo_rating_system) and [SoV](https://en.wikipedia.org/wiki/Strength_of_schedule#Computation), as well as attempting to implement the [Bradley-Terry model](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) (I had to take a couple liberties here as undefeated teams break the model [No dividing by 0]). The results were interesting to say the least!

The [spreadsheet](https://docs.google.com/spreadsheets/d/1ZNrG9KXu2seOHq_aFIenB4l1lQAf3DTsaAKWERIA9pU/edit?usp=sharing) I created using Google Sheets API lists every game played and resulting Elo calculations, as well as some other fun stuff! The rest of the numbers / models are in the [json](/json) folder.