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
    <nav className="w-full py-4 bg-foundation-alternate sticky top-0 z-50 backdrop-blur-sm transition-all duration-300 starry-bg">
      <Container className="flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/icons/pixsee_icon.svg"
            alt="Pixsee"
            width={40}
            height={40}
            className="h-auto object-contain img-to-white-dark"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full bg-transparent px-6 py-6 flex items-center gap-2 border-gray-300 hover:border-gray-400 shadow-lg"
            asChild
          >
            <Link href="/contact">
              Contact us
              <span className="text-lg"><ArrowRightCircle /></span>
            </Link>
          </Button>

          <ModeToggle />
        </div>
      </Container>
    </nav>
  );
};

export default ComingSoonNavbar;
