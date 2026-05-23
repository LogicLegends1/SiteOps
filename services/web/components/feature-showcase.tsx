"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";

interface Feature {
  icon: string; // icon name from lucide-react (plain serializable value)
  description: string;
}

interface FeatureShowcaseProps {
  features: Record<string, Feature>;
  selectedFeature?: string;
  handleOnMouseEnter?: (title: string) => void;
  handleOnMouseLeave?: (title?: string) => void;
}

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");

  React.useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <>
      {displayedText}
      <span className="inline-block w-1.5 h-[1.2em] bg-primary ml-1 align-text-bottom animate-pulse opacity-70" />
    </>
  );
}

export function FeatureShowcase({
  features,
  selectedFeature: controlledSelectedFeature,
  handleOnMouseEnter,
  handleOnMouseLeave,
}: FeatureShowcaseProps) {
  const [internalSelected, setInternalSelected] = useState<string | undefined>(undefined);
  const isControlled = controlledSelectedFeature !== undefined;
  const currentSelected = isControlled ? controlledSelectedFeature : internalSelected;

  const onEnter = (title: string) => {
    if (!isControlled) setInternalSelected(title);
    handleOnMouseEnter?.(title);
  };
  const onLeave = (title?: string) => {
    if (!isControlled) setInternalSelected(undefined);
    handleOnMouseLeave?.(title);
  };

  return (
    <section className="w-full mt-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-wrap justify-start gap-1 md:gap-2 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 sm:justify-start">
          {Object.entries(features).map(([title, { icon: iconName }]) => {
            const selected = currentSelected === title;
            const Icon = (Icons as any)[iconName] || Icons.MapPin;
            return (
              <div
                key={title}
                role="button"
                tabIndex={0}
                onMouseEnter={() => onEnter(title)}
                onMouseLeave={() => onLeave(title)}
                onFocus={() => onEnter(title)}
                onBlur={() => onLeave(title)}
                className="group relative flex items-center justify-center cursor-pointer outline-none"
              >
                <div
                  className={`inline-flex items-center justify-center p-3 transition-all duration-500 ease-out ${
                    selected
                      ? "text-primary scale-[1.7] drop-shadow-[0_0_15px_rgba(var(--primary),0.5)] -translate-y-4 z-20"
                      : currentSelected
                        ? "text-muted-foreground/30 scale-75 opacity-40 blur-[1px]"
                        : "text-muted-foreground hover:text-primary hover:scale-[1.2] hover:-translate-y-2 hover:drop-shadow-lg z-10"
                  }`}
                >
                  <Icon className={`h-8 w-8 ${selected ? "stroke-2" : "stroke-[1.5]"}`} />
                </div>
                {/* Subtle glow behind selected */}
                {selected && (
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10 animate-pulse" />
                )}
            </div>
          )})}
        </div>

        <div className="min-h-35 relative flex flex-col items-start pointer-events-none">
          {currentSelected && (
            <div 
              key={currentSelected}
              className="absolute inset-x-0 top-0 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 flex flex-col"
            >
              <h3 className="text-xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent sm:text-2xl">
                {currentSelected}
              </h3>
              <p className="mt-3 min-h-16 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
                <TypewriterText text={features[currentSelected]?.description || ""} />
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
