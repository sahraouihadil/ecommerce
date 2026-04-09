import {X,Menu,} from "lucide-react";

export default function Header({concept,setOpenBar,openBar}){
  return(
          
          <div className="flex justify-between items-center">
                      {/* mobile */}
        <div className="p-4 min-[600px]:hidden">
           <button onClick={()=>setOpenBar(!openBar)} className="p-3 min-[600px]:hidden">
          {openBar ? <X/> : <Menu/>}
        </button>
        </div>

                <h1 className="text-2xl font-bold">{concept}</h1>
                 
               </div>
    
  )
}