import { Input } from "@/components/ui/input"
import logo from "/src/assets/images/logo-w.png"

export default function Login() {
    return (
        <div className="flex h-screen overflow-hidden">
            <div className="h-full bg-green-800 w-[40%] flex items-center justify-center">
                <img src={logo} alt="logo EasyFinance"/>
            </div>
            <div className="h-full flex flex-col justify-center items-center w-[60%] gap-6"> 
                <form action="">
                    <Input type="email" placeholder="Email"/>
                    <Input type="password" placeholder="Senha"/>
                </form>
            </div>
        </div>
    )
}
