import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseJsonFieldsPipe implements PipeTransform<Record<string, unknown>> {
    transform(value: Record<string, unknown>) {
        if (typeof value.name === 'string') {
            value.name = JSON.parse(value.name);
        }

        if (typeof value.description === 'string') {
            value.description = JSON.parse(value.description);
        }
        return value;
    }
}
