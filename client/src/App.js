import { useState } from "react";

function App() {
   const [raw,setraw]=useState("")
   const [content,setcontent]=useState("")
   const [entities,setentities]=useState("")
   const [url,seturl]=useState("")
   const [result,setresult]=useState("")
   const [llm,setllm]=useState("")
    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        setraw(file); 
    };
    function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
    const handleSubmit=async()=>{
        const data=new FormData()
        data.append("file",raw)
        data.append("upload_preset",process.env.REACT_APP_UPLOAD_PRESET)
        data.append("cloud_name",process.env.REACT_APP_CLOUD_NAME)
        fetch("https://api.cloudinary.com/v1_1/ddsh73ik9/image/upload",{
            method:"post",
            body: data
        }).then((res)=>res.json()).then((data)=>{
            seturl(data.secure_url)
            fetch("http://127.0.0.1:5000/api/ocr",{
                method:"post",
                body:JSON.stringify(data)
            }).then((res)=>res.json()).then((res)=>{
                setcontent(res.content)
                fetch("http://127.0.0.1:5000/api/ner",{
                    method:"post",
                    body:JSON.stringify({content:res.content})
                }).then((res)=>res.json()).then((res)=>{
                    setentities(res.entities)
                    console.log(entities)
                   
                })
                fetch("http://127.0.0.1:5000/api/evaluate",{
                        method:"post",
                        body:JSON.stringify({content:res.content})
                    }).then((res)=>res.json()).then((result)=>{
                        setresult(result)
                    })
            })
        }).catch((err)=>{
            console.log(err)
        })

    }

    return (
        <div className="w-full flex  min-h-screen bg-[#91deece2]" style={{display:"flex",alignItems:"center",flexDirection:"column"}}>
            <div className="title">
        <h1 class="m-[3rem] text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Intelligent Scoring Tool</h1>
            </div>
            <div className="upload w-1/2">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <input type="file" id="dropzone-file" className="hidden" onChange={handleFileInputChange} />
                    </label>
                </div>
            </div>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-[2rem] max-w-[10rem]" onClick={handleSubmit}>
                Analyze
            </button>
            {
                content=="" || entities=="" ?<></>: <> <div className="process w-[100%] " style={{display:"flex",flexDirection:"row",padding:"1rem",justifyContent:"center",}}>
                    <div className="content" style={{border:"5px solid black",borderRadius:"1rem",padding:"1rem",margin:"5px",maxWidth:"49%"}}>
                        {/* {content} */}
                        <img src={url} alt="" />
                    </div>
                <div style={{border:"5px solid black",borderRadius:"1rem",padding:"1rem",margin:"5px",maxWidth:"49%"}}>
      
        {entities.map((entity, index) => {
            const color=getRandomColor()
            console.log(color)
            const temp="backgroundColor:"+color
            if(entity.label=="SENDER"){
                 return(
          <div key={index} style={{marginBottom:"10px"}}><span style={{backgroundColor:"blue",color:"white",borderRadius:"5px",padding:"3px",margin:"5px"}}>{`${entity.label} :`}</span>{`${content.slice(entity.start, entity.end)}`}</div>
        )
            }else if(entity.label=="RECEIVER"){
                 return(
          <div key={index} style={{marginBottom:"10px"}}><span style={{backgroundColor:"green",color:"white",borderRadius:"5px",padding:"3px",margin:"5px"}}>{`${entity.label} :`}</span>{`${content.slice(entity.start, entity.end)}`}</div>
        )
            }else if(entity.label=="DATE"){
                 return(
          <div key={index} style={{marginBottom:"10px"}}><span style={{backgroundColor:"brown",color:"white",borderRadius:"5px",padding:"3px",margin:"5px"}}>{`${entity.label} :`}</span>{`${content.slice(entity.start, entity.end)}`}</div>
        )
            }else if(entity.label=="GREETINGS"){
                 return(
          <div key={index} style={{marginBottom:"10px"}} ><span style={{backgroundColor:"#109837",color:"white",borderRadius:"5px",padding:"3px",margin:"5px"}}>{`${entity.label} :`}</span>{`${content.slice(entity.start, entity.end)}`}</div>
        )
            }else if(entity.label=="CONTENT"){
                return(
          <div key={index} style={{marginBottom:"10px"}}><span style={{backgroundColor:"#FF7A33",color:"white",borderRadius:"5px",padding:"3px",margin:"5px"}}>{`${entity.label} :`}</span>{`${content.slice(entity.start, entity.end)}`}</div>
        )
                
            }else if(entity.label=="SUBJECT"){
                 return(
          <div key={index} style={{marginBottom:"10px"}}><span style={{backgroundColor:"#FF3342",color:"white",borderRadius:"5px",padding:"3px",margin:"5px"}}>{`${entity.label} :`}</span>{`${content.slice(entity.start, entity.end)}`}</div>
        )
            }else if(entity.label=="REGARDS"){
                 return(
          <div key={index} style={{marginBottom:"10px"}}><span style={{backgroundColor:"#B833FF",color:"white",borderRadius:"5px",padding:"3px",margin:"5px"}}>{`${entity.label} :`}</span>{`${content.slice(entity.start, entity.end)}`}</div>
        )
            }
           })}
   
      
    </div>


            </div>
                        <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-[3rem]">
    <table class="w-full text-sm text-left rtl:text-right text-blue-100 dark:text-blue-100">
        <thead class="text-xs text-white uppercase bg-blue-600 dark:text-white">
            <tr>
                <th scope="col" class="px-6 py-3">
                    Characters
                </th>
                <th scope="col" class="px-6 py-3">
                    Words
                </th>
                <th scope="col" class="px-6 py-3">
                    Average Word Length
                </th>
             
                <th scope="col" class="px-6 py-3">
                    Nouns
                </th>
                  <th scope="col" class="px-6 py-3">
                    Verbs
                </th>
                  <th scope="col" class="px-6 py-3">
                    Adjectives
                </th>
                  <th scope="col" class="px-6 py-3">
                    Adverbs
                </th>
                <th scope="col" class="px-6 py-3">
                    Format Score
                </th>
                <th scope="col" class="px-6 py-3">
                    Content Score
                </th>
                <th scope="col" class="px-6 py-3">
                    Final Score
                </th>
            </tr>
        </thead>
        <tbody>
          
            <tr class="bg-blue-600 border-b border-blue-400">
                <td scope="row" class="px-6 py-4  text-blue-50 whitespace-nowrap dark:text-blue-100">
                    {result.chars}
                </td>
                <td class="px-6 py-4">
                        {result.words}
                </td>
                <td class="px-6 py-4">
                    {result.avg.toFixed(2)}
                </td>
         
                <td class="px-6 py-4">
                        {result.nouns}
                </td>
                 <td class="px-6 py-4">
                        {result.verbs}
                </td>
                 <td class="px-6 py-4">
                        {result.adjectives}
                </td>
                      <td class="px-6 py-4">
                        {result.adverbs}
                </td>
                 <td class="px-6 py-4">
                        10
                </td>
                 <td class="px-6 py-4">
                        {result.score}
                </td>
                 <td class="px-6 py-4">
                        9
                </td>
            </tr>
      
        </tbody>
    </table>
</div>
</>
        }

     

          
        </div>
    );
}

export default App;
