import Image from "next/image";
import Link from "next/link";
import Navigation from "./components/Navigation";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <Navigation />

      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to XGenLens</h1>
          <p className="text-xl mb-8">
            Your AI-powered image generation platform
          </p>

          <Link
            href="/generate"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-base h-12 px-6 mx-auto"
          >
            Create an Image
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Powerful AI Generation
            </h2>
            <p className="mb-4">
              XGenLens uses cutting-edge AI models to generate high-quality
              images from your text descriptions.
            </p>
            <Image
              src="/next.svg"
              alt="AI Generation"
              width={180}
              height={38}
              className="mx-auto dark:invert"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Customizable Options</h2>
            <p className="mb-4">
              Fine-tune your generated images with adjustable parameters like
              diffusion strength and style intensity.
            </p>
            <div className="flex justify-center">
              <Image
                src="/vercel.svg"
                alt="Customization"
                width={120}
                height={30}
                className="dark:invert"
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>© 2023 XGenLens. All rights reserved.</p>
      </footer>
    </div>
  );
}
