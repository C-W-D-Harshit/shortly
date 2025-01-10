import { useState } from "react";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import { toast } from "sonner";

export default function App() {
  // State for URL input and shortened result
  const [longUrl, setLongUrl] = useState<string>("");
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  /**
   * Handles the URL shortening process
   */
  const handleShorten = async (): Promise<void> => {
    if (!longUrl) {
      setError("Please enter a URL");
      return;
    }

    const toastId = toast.loading("Shortening URL...");
    try {
      setIsLoading(true);
      setError("");

      // TODO: Replace with actual API call
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ longUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }

      const data = await response.json();
      setShortenedUrl(data.shortUrl);
      toast.success("URL shortened successfully", { id: toastId });
    } catch (err) {
      console.error(err);
      setError("Failed to shorten URL. Please try again.");
      toast.error("Failed to shorten URL. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles copying the shortened URL to clipboard
   */
  const handleCopy = async (): Promise<void> => {
    if (shortenedUrl) {
      try {
        await navigator.clipboard.writeText(shortenedUrl);
        toast.success("URL copied to clipboard");
      } catch (err) {
        console.error(err);
        setError("Failed to copy to clipboard");
      }
    }
  };

  return (
    <main className="w-full min-h-dvh flex flex-col bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-screen-lg mx-auto px-4 py-8 flex-1 h-full w-full flex flex-col justify-between">
        {/* Header with Logo and Auth Buttons */}
        <div className="mb-12 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.07 7.07l.354-.353a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.353a5 5 0 0 0 0 7.071l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z"
              />
            </svg>
            <p className="text-2xl font-bold text-primary">short.ly</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              Login
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Signup
            </Button>
          </div>
        </div>

        {/* URL Input Section */}
        <div className="flex w-full flex-1">
          <div className="w-full flex-1 flex flex-col justify-center gap-8">
            {/* Left Column - URL Input */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Paste your long URL here:
              </h1>
              <div className="space-y-4 max-w-lg">
                <div className="relative flex w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.07 7.07l.354-.353a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.353a5 5 0 0 0 0 7.071l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z"
                      />
                    </svg>
                  </div>
                  <input
                    type="url"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="https://www.cleverdeveloper.in/projects/system-prompt-generator"
                    className="focus:outline-none w-full"
                  />
                  <Button
                    onClick={handleShorten}
                    disabled={isLoading}
                    className="rounded-full"
                  >
                    {isLoading ? "Shortening..." : "Shorten"}
                  </Button>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </div>

            <div className="flex gap-3 items-center max-w-screen-md">
              <h1
                className={cn(
                  "text-3xl font-bold text-muted-foreground mb-4 min-w-max"
                )}
              >
                Your short url:
              </h1>
              <div className="space-y-4 w-full">
                <div className="relative flex w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.07 7.07l.354-.353a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.353a5 5 0 0 0 0 7.071l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z"
                      />
                    </svg>
                  </div>
                  <input
                    type="url"
                    value={shortenedUrl || ""}
                    readOnly
                    placeholder="https://short.ly/1234567890"
                    className="focus:outline-none w-full"
                  />
                  <Button
                    onClick={handleCopy}
                    disabled={!shortenedUrl}
                    className="rounded-full"
                  >
                    {shortenedUrl ? "Copy" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="w-full flex-1"></div> */}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} - Shortly
        </div>
      </div>
    </main>
  );
}
