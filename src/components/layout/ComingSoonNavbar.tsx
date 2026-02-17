import React from "react";
import Container from "../ui/Container";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ModeToggle } from "../ui/ModeToggle";
import { ArrowRightCircle } from "lucide-react";

type Props = {};

const ComingSoonNavbar = (props: Props) => {
  return (
    <nav className="w-full py-4 sticky top-0 z-50 transition-all duration-300 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 z-0 animate-[gridGlide_24s_linear_infinite]"
        style={{
          backgroundImage: "url('/images/bg_grid_pattern_white.png')",
          backgroundSize: "1200px 1200px",
          backgroundRepeat: "repeat",
          backgroundBlendMode: "screen",
          backgroundPosition: "center",
          mixBlendMode: "screen",
        }}
      />

      <div className="absolute inset-0 z-10 backdrop-blur-sm" />

      <Container className="flex items-center justify-between relative z-20">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/pixsee_logo.png"
            alt="Pixsee"
            width={40}
            height={40}
            className="h-10 md:h-auto object-contain img-to-white-dark"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full bg-transparent px-3 py-3 md:px-6 md:py-5 flex items-center gap-2 border-gray-300 hover:border-gray-400 shadow-lg"
            asChild
          >
            <a href="https://x.com/PixseeIO">
              Contact us
              <span className="text-lg">
                <ArrowRightCircle />
              </span>
            </a>
          </Button>

          <ModeToggle />
        </div>
      </Container>
    </nav>
  );
};

export default ComingSoonNavbar;
