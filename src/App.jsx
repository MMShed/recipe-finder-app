import React, {useState, useEffect} from 'react'
import './styles.css'

function App() {

  let [page, setPage] = useState("home")
  let [search, setSearch] = useState("")
  let [results, setResults] = useState([])

  let [nextLink, setNextLink] = useState(null)
  let [prevLink, setPrevLink] = useState(null)
  
  let [currRecipe, setCurrRecipe] = useState()

  const API_KEY = import.meta.env.VITE_API_KEY


  async function searchRecipe (query)
  {
    const response = await fetch(
    `https://recipeapi.io/api/v1/recipes?search=${query}`,
    {headers: {"Authorization": `Bearer ${API_KEY}`}}
    );

    if (response.ok)
    {
      setPage("lookup")

      let parsedInfo = await response.json()

      console.log(parsedInfo)

      setResults(parsedInfo.data)

      setNextLink(parsedInfo.links.next)
      setPrevLink(parsedInfo.links.prev)
    }
        
  }

  async function scrollRecipe (next)
  {
    let response = ""
    
    if (next)
    {
      response = await fetch(
      nextLink,
      {headers: {"Authorization": `Bearer ${API_KEY}`}}
      );
    }
    else
    {
      response = await fetch(
      prevLink,
      {headers: {"Authorization": `Bearer ${API_KEY}`}}
      );
    }

    if (response.ok)
    {
      let parsedInfo = await response.json()

      console.log(parsedInfo)

      setResults(parsedInfo.data)

      setNextLink(parsedInfo.links.next)
      setPrevLink(parsedInfo.links.prev)
    }

  }

  function viewRecipe(event)
  {
    setPage("view_recipe")

    let selected_recipe = results.filter (recipe => recipe.name == event.target.id)[0]

    setCurrRecipe(selected_recipe)
  }



  if (page === "home")
  {
    return (
      <div className='appContainer'>
        <h1>Welcome to the recipe searcher!</h1>
        <h4>Search up any recipes of your choice!</h4>

        <div className='searchBar'>
          <input type="text" onChange={(e) => setSearch(e.target.value)}></input>
          <button onClick={(e) => searchRecipe(search)}>Search Recipe</button>
        </div>
      </div>
    );
  }

  else if (page == "lookup")
  {
    return (
      <>
        <div className='searchBar'>
          <input type="text" onChange={(e) => setSearch(e.target.value)}></input>
          <button onClick={(e) => searchRecipe(search)}>Search Recipe</button>
        </div>

        <div className='resultsGrid'>
        {
          results.map (recipe => {
            return (
              
              <div className='container'>
                <div className='recipeCard'>
                  <h1>{recipe.name}</h1>

                  <div className='keyInfo'>
                    <p>Difficulty:{recipe.difficulty}</p>
                    <p>Prep time: {recipe.prep_time} minutes</p>
                    <p>Cook time: {recipe.cook_time} minutes</p>
                  </div>

                  <p>{recipe.description}</p>

                  <button className='view-recipe' id={recipe.name} onClick={(e) => viewRecipe(e)}>View Recipe</button>
                </div>
              </div>
              
            );
          })}
        </div>
          

        <div className='pagination'>
          {nextLink && (
              <button onClick={() => scrollRecipe(true)}>
                Next
              </button>
            )}

          {prevLink && (
            <button onClick={() => scrollRecipe(false)}>
              Previous
            </button>
          )}

          <button onClick={(e) => {
            setPage("home")
          }}>Home Page</button>

        </div>
          
          

      </>
    );
  }
  else if (page == "view_recipe")
  {
    return (
      <>
        <h2>Recipe for {currRecipe.name}</h2>

        <ul>
          Ingredients:

          {
            currRecipe.ingredients.map ((ingredient) =>
               {return <li>{ingredient.quantity} {ingredient.unit} {ingredient.name} {ingredient.optional && <em>"(Optional)"</em>}</li>})
          }

        </ul>


        <ol>
          Recipe:

          {
            currRecipe.instructions.map ((step) =>
            {
              return <li>{step}</li>
            })
          }

        </ol>

        <button onClick={(e) => setPage("lookup")}>Go Back</button>

      </>
    )
  }
}

export default App
