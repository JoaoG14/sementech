import { NextResponse } from 'next/server'
import PipelineSingleton from './pipeline.js';

export async function GET(request) {
    const url = 'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cats.png';
    // Get the classification pipeline. When called for the first time,
    // this will load the pipeline and cache it for future use.
    const classifier = await PipelineSingleton.getInstance();

    // Actually perform the classification
    const features = await classifier(url);

    return NextResponse.json(features);
}