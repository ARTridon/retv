import { FormLabel } from "@/web/components/ui/form";
import { cn } from "@/web/lib/utils";

function AutoFormLabel({
  label,
  isRequired,
  className,
}: {
  label: string;
  isRequired: boolean;
  className?: string;
}) {
  return (
    <>
      <FormLabel className={cn(className)}>
        {label}
        {isRequired && <span className="text-destructive"> *</span>}
      </FormLabel>
    </>
  );
}

export default AutoFormLabel;
