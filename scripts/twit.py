import json
import re
import requests

def unshorten_url(short_url):
    """Follow redirects to get the actual URL from a shortened one."""
    try:
        response = requests.head(short_url, allow_redirects=True, timeout=5)
        return response.url
    except Exception:
        return short_url

def expand_urls_in_text(text, media_urls=None):
    """Replace t.co shortened URLs with their expanded versions, except media URLs."""
    if not text:
        return text
    
    t_co_pattern = r'https://t\.co/[a-zA-Z0-9]+'
    t_co_urls = re.findall(t_co_pattern, text)
    
    if not t_co_urls:
        return text
    
    if media_urls and t_co_urls[-1] in media_urls:
        urls_to_expand = t_co_urls[:-1]
    else:
        urls_to_expand = t_co_urls
    
    expanded_urls = {}
    for short_url in urls_to_expand:
        expanded_url = unshorten_url(short_url)
        if expanded_url != short_url:
            expanded_urls[short_url] = expanded_url
    
    result = text
    for short_url, expanded_url in expanded_urls.items():
        result = result.replace(short_url, expanded_url)
    
    return result

def clean_tweet_new_format(tweet):
    """Clean a tweet from the new format."""
    full_text = tweet.get("full_text", "")
    
    media_urls = []
    if "media" in tweet and tweet["media"]:
        for media in tweet["media"]:
            if "url" in media:
                media_urls.append(media["url"])
    elif "metadata" in tweet and "legacy" in tweet["metadata"] and "entities" in tweet["metadata"]["legacy"] and "media" in tweet["metadata"]["legacy"]["entities"]:
        for media in tweet["metadata"]["legacy"]["entities"]["media"]:
            if "url" in media:
                media_urls.append(media["url"])
    
    full_text = expand_urls_in_text(full_text, media_urls)
    
    if len(full_text) > 400:
        last_space_index = full_text[:400].rfind(" ")
        if last_space_index > 0:
            full_text = full_text[:last_space_index] + "..."
        else:
            full_text = full_text[:397] + "..."
    
    cleaned_tweet = {
        "profile_image_url_https": tweet.get("profile_image_url", ""),
        "screen_name": tweet.get("screen_name", ""),
        "name": tweet.get("name", ""),
        "full_text": full_text,
        "tweeted_at": tweet.get("created_at", ""),
        "tweet_url": tweet.get("url", "")
    }
    
    if "metadata" in tweet and "note_tweet" in tweet["metadata"]:
        note = tweet["metadata"]["note_tweet"]["note_tweet_results"]["result"]["text"]
        cleaned_tweet["note_tweet_text"] = note
    
    metrics = [
        "favorite_count", "retweet_count", "bookmark_count", 
        "reply_count", "views_count"
    ]
    
    for metric in metrics:
        if metric in tweet:
            cleaned_tweet[metric] = tweet[metric]
    
    if "retweeted_status" in tweet and tweet["retweeted_status"]:
        cleaned_tweet["is_retweet"] = True
        
        if isinstance(tweet["retweeted_status"], dict):
            original_tweet = tweet["retweeted_status"]
            cleaned_tweet["retweet_author"] = original_tweet.get("screen_name", "")
            cleaned_tweet["retweet_author_name"] = original_tweet.get("name", "")
            cleaned_tweet["retweet_text"] = original_tweet.get("full_text", "")
            cleaned_tweet["retweet_url"] = original_tweet.get("url", "")
    else:
        cleaned_tweet["is_retweet"] = False
    
    if "quoted_status" in tweet and tweet["quoted_status"]:
        cleaned_tweet["is_quote"] = True
        
        if isinstance(tweet["quoted_status"], str):
            cleaned_tweet["quoted_tweet_id"] = tweet["quoted_status"]
            
            if "metadata" in tweet and "legacy" in tweet["metadata"] and "quoted_status_permalink" in tweet["metadata"]["legacy"]:
                permalink = tweet["metadata"]["legacy"]["quoted_status_permalink"]
                if "expanded" in permalink:
                    cleaned_tweet["quoted_tweet_url"] = permalink["expanded"]
                elif "url" in permalink:
                    cleaned_tweet["quoted_tweet_url"] = permalink["url"]
                
            if "metadata" in tweet and "quoted_status_result" in tweet["metadata"] and "result" in tweet["metadata"]["quoted_status_result"]:
                quoted_result = tweet["metadata"]["quoted_status_result"]["result"]
                if "legacy" in quoted_result:
                    quoted_legacy = quoted_result["legacy"]
                    cleaned_tweet["quoted_tweet_text"] = quoted_legacy.get("full_text", "")
                    
                    if "core" in quoted_result and "user_results" in quoted_result["core"] and "result" in quoted_result["core"]["user_results"]:
                        quoted_user = quoted_result["core"]["user_results"]["result"]
                        if "legacy" in quoted_user:
                            quoted_user_legacy = quoted_user["legacy"]
                            cleaned_tweet["quoted_tweet_author"] = quoted_user_legacy.get("screen_name", "")
                            cleaned_tweet["quoted_tweet_author_name"] = quoted_user_legacy.get("name", "")
        
        elif isinstance(tweet["quoted_status"], dict):
            quoted_tweet = tweet["quoted_status"]
            cleaned_tweet["quoted_tweet_id"] = quoted_tweet.get("id", "")
            cleaned_tweet["quoted_tweet_text"] = quoted_tweet.get("full_text", "")
            cleaned_tweet["quoted_tweet_url"] = quoted_tweet.get("url", "")
            cleaned_tweet["quoted_tweet_author"] = quoted_tweet.get("screen_name", "")
            cleaned_tweet["quoted_tweet_author_name"] = quoted_tweet.get("name", "")
    else:
        cleaned_tweet["is_quote"] = False
    
    if "media" in tweet and tweet["media"]:
        cleaned_media = []
        
        for media in tweet["media"]:
            cleaned_media_item = {
                "type": media.get("type", ""),
                "url": media.get("url", "")
            }
            
            if media.get("type") == "photo":
                cleaned_media_item["media_url_https"] = media.get("original", "")
            
            elif media.get("type") == "video":
                cleaned_media_item["video_url"] = media.get("original", "")
            
            cleaned_media.append(cleaned_media_item)
        
        cleaned_tweet["extended_media"] = cleaned_media
    
    elif "metadata" in tweet and "legacy" in tweet["metadata"] and "extended_entities" in tweet["metadata"]["legacy"]:
        cleaned_media = []
        
        for media in tweet["metadata"]["legacy"]["extended_entities"]["media"]:
            cleaned_media_item = {
                "display_url": media.get("display_url", ""),
                "expanded_url": media.get("expanded_url", ""),
                "type": media.get("type", "")
            }
            
            if media.get("type") == "photo":
                cleaned_media_item["media_url_https"] = media.get("media_url_https", "")
            
            elif media.get("type") == "video" and "video_info" in media:
                mp4_variants = [
                    v for v in media["video_info"].get("variants", [])
                    if v.get("content_type") == "video/mp4" and "bitrate" in v
                ]
                
                if mp4_variants:
                    lowest_bitrate_mp4 = min(mp4_variants, key=lambda x: x.get("bitrate", float("inf")))
                    cleaned_media_item["video_url"] = lowest_bitrate_mp4.get("url", "")
                    cleaned_media_item["bitrate"] = lowest_bitrate_mp4.get("bitrate", "")
            
            cleaned_media.append(cleaned_media_item)
        
        cleaned_tweet["extended_media"] = cleaned_media
    
    return cleaned_tweet

def main():
    try:
        with open("twitter-Bookmarks-1754738301351.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError) as e:
        print(f"Error loading twitter.json: {e}")
        return
    
    cleaned_data = [clean_tweet_new_format(tweet) for tweet in data]
    cleaned_data.reverse()
    
    try:
        with open("../static/pprepared.json", "w", encoding="utf-8") as f:
            json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
        print("Successfully created prepared.json")
    except Exception as e:
        print(f"Error saving prepared.json: {e}")

if __name__ == "__main__":
    main()
