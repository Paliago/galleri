import { Link, useLocation } from "react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "./ui/breadcrumb";

const formatPathSegment = (segment: string) => {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const breadcrumbPaths = pathSegments.map((_, index) => {
    return "/" + pathSegments.slice(0, index + 1).join("/");
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;

          return (
            <BreadcrumbItem key={segment}>
              {isLast ? (
                <BreadcrumbPage>{formatPathSegment(segment)}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={breadcrumbPaths[index]}>
                      {formatPathSegment(segment)}
                    </Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
