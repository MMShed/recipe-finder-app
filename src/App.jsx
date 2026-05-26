import React, {useState, useEffect} from 'react'
import './styles.css'

function App() {


  const dietary_restrictions = ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'halal', 'kosher']
  const cuisines = ['american', 'french', 'greek', 'italian', 'japanese', 'mexican', 'portuguese', 'spanish', 'thai', 'turkish']
  const meal_types = ['starter', 'main', 'dessert', 'appetizer', 'breakfast', 'brunch', 'snack', 'side_dish', 'soup', 'drink', 'sauce']

  const API_KEY = import.meta.env.VITE_API_KEY

  let [page, setPage] = useState("home")
  let [search, setSearch] = useState("")
  let [results, setResults] = useState([])

  let [nextLink, setNextLink] = useState(null)
  let [prevLink, setPrevLink] = useState(null)
  
  let [currRecipe, setCurrRecipe] = useState()
  let [fetchURL, setFetchURL] = useState("")

  const [showFilters, setShowFilters] = useState(false);

  //Handle removing filters too!
  const [filters, setFilters] = useState({
    cuisine: [],
    meal_type: [],
    difficulty: [],
    dietary_tags: [],
    calories: { min: "", max: "" },
    protein: { min: "", max: "" }
  });

  useEffect (() => {
    for (const [key, value] of Object.entries(filters))
    {
      if (Array.isArray(value) && value.length > 0)
      {
        setFetchURL(prev => prev + `${key}=${value[0]}&`)
      }
    }

  }, [filters])

  async function searchRecipe (query)
  {
    //TODO: Handle query
    let requestURL = `https://recipeapi.io/api/v1/recipes?`
    

    if (search !== "")
    {
      requestURL += `search=${query}&`
    }

    if (fetchURL !== "")
    {
      requestURL += fetchURL
    }

    if (requestURL[requestURL.length - 1] == '&') {requestURL.slice(0, -1)}

    const response = await fetch(
    requestURL,
    {headers: {"Authorization": `Bearer ${API_KEY}`}}
    );

    if (response.ok)
    {
      setPage("lookup")

      let parsedInfo = await response.json()


      setResults(parsedInfo.data)

      setNextLink(parsedInfo.links.next)
      setPrevLink(parsedInfo.links.prev)

      if (parsedInfo.data.length == 0) {setPage("no recipes found")}
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
        <h1>Welcome to Reci-Detector (Beta)</h1>
        <h4>Search up any recipes of your choice!</h4>
        <h3>Use the filters to find recipes of your choice!</h3>

        <div className='searchBar'>
          <input type="text" onChange={(e) => setSearch(e.target.value)}></input>
          <button onClick={(e) => searchRecipe(search)}>Search Recipe</button>
        </div>


        <button className='filter-btn' onClick={() => setShowFilters(prev => !prev)}>Filters</button>

        {showFilters && (
          <div className="filtersPanel">
            <div className='Dietary Filters'>
              
              <h4>Dietary Restrictions</h4>

              {
                dietary_restrictions.map (restriction => {
                  return (
                    <div className='option'>
                      <input type='radio' id={restriction} onChange={(e) => {

                          setFilters({...filters, dietary_tags: [e.target.id]})

                      }}></input>
                      <label htmlFor={restriction}>{restriction.replaceAll("_", "-")}</label>
                    </div>
                  );
                })
              }
            </div>

            <div className='Cuisines'>
              
              <h4>Cuisine</h4>

              {
                cuisines.map (cuisine => {
                  return (
                    <div className='option'>
                      <input type='radio' id={cuisine} onChange={(e) => {

                        setFilters({...filters, cuisine: [e.target.id]})
                      
                      }}></input>
                      <label htmlFor={cuisine}>{cuisine}</label>
                    </div>
                  );
                })
              }
            </div>


            
            <div className='Meal Types'>
              
              <h4>Meal Types</h4>

              {
                meal_types.map (meal => {
                  return (
                    <div className='option'>
                      <input type='radio' id={meal} onChange={(e) => {
                        setFilters({...filters, meal: [e.target.id]})
                      }}></input>
                      <label htmlFor={meal}>{meal}</label>
                    </div>
                  );
                })
              }
            </div>

          </div>

        )}
  
        
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
  else if (page == "no recipes found")
  {
    return <>
      <h1>No recipes were found. Please try a different query.</h1>
    </>
  }
}

export default App
