import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'NameFormatter'
})
export class NameFormatterPipe implements PipeTransform {
transform(value: string | undefined | null): string {
  if (!value) return '';

  // Try to detect camelCase or glued words
  const spaced = value
    .replace(/([a-z])([A-Z])/g, '$1 $2')         // "johnDoe" → "john Doe"
    .replace(/([a-z]{2,})([A-Z][a-z]+)/g, '$1 $2'); // "johndoeSmith" → "johndoe Smith"

  return spaced
    .trim()
    .split(/\s+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
}
