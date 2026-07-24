"use client";
import GeometryChoiceWorksheet from "../components/geometry-choice-worksheet";
import { spaceCoordinateProblemSets, spaceCoordinateProblems } from "../../../../lib/geometry-workouts";
export default function SpaceCoordinatesPage() {
  return <GeometryChoiceWorksheet title="공간좌표" seed={20260816} problems={spaceCoordinateProblems} problemSets={spaceCoordinateProblemSets} />;
}
