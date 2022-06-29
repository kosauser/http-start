import { HttpClient, HttpEventType, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Subject, tap, throwError } from "rxjs";
import { Post } from "./post.model";

@Injectable({providedIn: 'root'})
export class PostsService {

    error = new Subject<string>();
    constructor(private http: HttpClient) {

    }

    createAndStorePost(title: string, content: string) {
        const postData: Post = {title: title, content: content};
        this.http.post<{ name: string }>('https://ng-complete-guide-df06b-default-rtdb.europe-west1.firebasedatabase.app/posts.json', 
            postData,
            {
                observe: 'response' // to retrive for example whole HTTP response instead of returned body of response
            })
            .subscribe(responseData => {
              console.log(responseData);
            }, error => {
                this.error.next(error.message);
            });
    }
    
    fetchPosts() {
        let searchParmas = new HttpParams();
        searchParmas = searchParmas.append('print', 'pretty');
        searchParmas = searchParmas.append('custom', 'key');
        return this.http
            .get<{ [key: string]: Post }>('https://ng-complete-guide-df06b-default-rtdb.europe-west1.firebasedatabase.app/posts.json',
            {
                headers: new HttpHeaders({'Custom-Header': 'Hello'}),
                // params: new HttpParams().set('print', 'pretty')
                params: searchParmas,
                responseType: 'json' //default is also 'json'
            })
            .pipe(map(responseData => { // [key: string] mean any string key, we do not know key name
                const postArray: Post[] = [];
                for (const key in responseData) {
                    if (responseData.hasOwnProperty(key)) {
                    postArray.push({ ...responseData[key], id: key });
                    }
                }
                return postArray;
            }), catchError(errorRes => {
                return throwError(errorRes);
            }));
    }

    deletePosts() {
        return this.http.delete('https://ng-complete-guide-df06b-default-rtdb.europe-west1.firebasedatabase.app/posts.json',
        {
            observe: 'events', // something like peek in java, but it does not change content
            responseType: 'text'
        }).pipe(tap(event => {
            if (event.type == HttpEventType.Sent) {
                console.log('Request was sent!');
            }
            if (event.type == HttpEventType.Response) {
                console.log(event.body);
            }
        }));
    }
}